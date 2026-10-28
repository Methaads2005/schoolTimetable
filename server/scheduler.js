/**
 * School Timetable Scheduler & Conflict Engine
 * Features:
 * 1. Automatic timetable generation using backtracking & constraint satisfaction
 * 2. Automatic period splitting across days
 * 3. Consecutive period allocation for Laboratories
 * 4. Automatic teacher qualification & workload balancing
 * 5. Dynamic substitution suggestion engine
 * 6. Real-time conflict validation
 */

export class TimetableEngine {
  /**
   * Validate full timetable for conflicts and constraints
   */
  static validateTimetable(timetable, teachers, classes, subjects, laboratories, requirements, leaves = [], tests = []) {
    const conflicts = [];
    const teacherMap = new Map(teachers.map(t => [t.id, t]));
    const classMap = new Map(classes.map(c => [c.name, c]));
    const labMap = new Map(laboratories.map(l => [l.id, l]));

    // 1. Group timetable by day and period
    const slotMap = new Map(); // key: `${day}-${period}-${shift}` -> list of entries
    const teacherSlotMap = new Map(); // key: `${teacherId}-${day}-${period}` -> entry
    const classSlotMap = new Map(); // key: `${classId}-${day}-${period}` -> entry
    const labSlotMap = new Map(); // key: `${labId}-${day}-${period}` -> entry

    // Workload counters
    const teacherDailyWorkload = new Map(); // `${teacherId}-${day}` -> count
    const teacherWeeklyWorkload = new Map(); // `${teacherId}` -> count
    const classSubjectWeeklyCount = new Map(); // `${classId}-${subjectId}` -> count

    timetable.forEach(entry => {
      const { day, period, shift = 'regular', teacherId, classId, labId, subjectId } = entry;
      const slotKey = `${day}-${period}-${shift}`;

      // Check Class Double-Booking
      const classKey = `${classId}-${slotKey}`;
      if (classSlotMap.has(classKey)) {
        conflicts.push({
          type: 'CLASS_DOUBLE_BOOKED',
          severity: 'error',
          classId,
          day,
          period,
          message: `Class ${classId} has multiple subjects scheduled simultaneously on ${day}, Period ${period}.`,
          suggestion: `Remove one of the conflicting assignments or shift to another free period.`
        });
      } else {
        classSlotMap.set(classKey, entry);
      }

      // Check Teacher Double-Booking (Active teacher or substitute)
      const effectiveTeacherId = entry.substitutedTeacherId || teacherId;
      if (effectiveTeacherId && effectiveTeacherId !== 'unassigned') {
        const teacherKey = `${effectiveTeacherId}-${slotKey}`;
        if (teacherSlotMap.has(teacherKey)) {
          const conflicting = teacherSlotMap.get(teacherKey);
          conflicts.push({
            type: 'TEACHER_DOUBLE_BOOKED',
            severity: 'error',
            teacherId: effectiveTeacherId,
            teacherName: entry.substitutedTeacherName || entry.teacherName,
            day,
            period,
            message: `Teacher ${entry.substitutedTeacherName || entry.teacherName} is assigned to both Class ${conflicting.classId} and Class ${classId} on ${day}, Period ${period}.`,
            suggestion: `Reassign one class to another qualified teacher in that department.`
          });
        } else {
          teacherSlotMap.set(teacherKey, entry);
        }

        // Check if teacher is marked absent/on leave
        const isOnLeave = leaves.some(l => l.teacherId === effectiveTeacherId && (!l.day || l.day === day));
        if (isOnLeave && !entry.substitutedTeacherId) {
          conflicts.push({
            type: 'TEACHER_ON_LEAVE',
            severity: 'error',
            teacherId: effectiveTeacherId,
            teacherName: entry.teacherName,
            day,
            period,
            classId,
            message: `Teacher ${entry.teacherName} is on approved leave on ${day}, but is assigned to Class ${classId} in Period ${period}.`,
            suggestion: `Use the Substitution Manager to assign an available substitute teacher.`
          });
        }

        // Check teacher working days
        const teacherObj = teacherMap.get(effectiveTeacherId);
        if (teacherObj) {
          if (teacherObj.workingDays && !teacherObj.workingDays.includes(day)) {
            conflicts.push({
              type: 'TEACHER_UNAVAILABLE_DAY',
              severity: 'warning',
              teacherId: effectiveTeacherId,
              teacherName: teacherObj.name,
              day,
              period,
              message: `Teacher ${teacherObj.name} is scheduled on ${day}, which is outside their available working days.`,
              suggestion: `Reassign to an available working day or assign another staff member.`
            });
          }

          // Check teacher unavailable specific slots
          if (teacherObj.unavailablePeriods) {
            const isBlocked = teacherObj.unavailablePeriods.some(u => u.day === day && String(u.period) === String(period));
            if (isBlocked) {
              conflicts.push({
                type: 'TEACHER_SLOT_UNAVAILABLE',
                severity: 'warning',
                teacherId: effectiveTeacherId,
                teacherName: teacherObj.name,
                day,
                period,
                message: `Teacher ${teacherObj.name} marked ${day} Period ${period} as an unavailable preferred slot.`,
                suggestion: `Move this subject to one of their preferred periods.`
              });
            }
          }
        }

        // Track daily workload
        const dayWorkloadKey = `${effectiveTeacherId}-${day}`;
        const currentDaily = (teacherDailyWorkload.get(dayWorkloadKey) || 0) + 1;
        teacherDailyWorkload.set(dayWorkloadKey, currentDaily);

        // Track weekly workload
        const currentWeekly = (teacherWeeklyWorkload.get(effectiveTeacherId) || 0) + 1;
        teacherWeeklyWorkload.set(effectiveTeacherId, currentWeekly);
      }

      // Check Lab Collision
      if (labId) {
        const labSlotKey = `${labId}-${slotKey}`;
        if (labSlotMap.has(labSlotKey)) {
          const conflicting = labSlotMap.get(labSlotKey);
          const labObj = labMap.get(labId);
          conflicts.push({
            type: 'LAB_DOUBLE_BOOKED',
            severity: 'error',
            labId,
            day,
            period,
            message: `Laboratory "${labObj ? labObj.name : labId}" is double booked by Class ${conflicting.classId} and Class ${classId} on ${day}, Period ${period}.`,
            suggestion: `Reschedule one class's lab session to an open lab period.`
          });
        } else {
          labSlotMap.set(labSlotKey, entry);
        }
      }

      // Track Class-Subject weekly count
      if (shift === 'regular' && subjectId) {
        const csKey = `${classId}-${subjectId}`;
        classSubjectWeeklyCount.set(csKey, (classSubjectWeeklyCount.get(csKey) || 0) + 1);
      }
    });

    // Check Max Workload Constraints
    teachers.forEach(teacher => {
      // Daily check
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].forEach(day => {
        const dailyCount = teacherDailyWorkload.get(`${teacher.id}-${day}`) || 0;
        const maxDaily = teacher.maxPeriodsPerDay || 5;
        if (dailyCount > maxDaily) {
          conflicts.push({
            type: 'MAX_DAILY_WORKLOAD_EXCEEDED',
            severity: 'warning',
            teacherId: teacher.id,
            teacherName: teacher.name,
            day,
            message: `Teacher ${teacher.name} has ${dailyCount} periods scheduled on ${day} (Maximum allowed: ${maxDaily}).`,
            suggestion: `Spread some periods to days with lower workload.`
          });
        }
      });

      // Weekly check
      const weeklyCount = teacherWeeklyWorkload.get(teacher.id) || 0;
      const maxWeekly = teacher.maxPeriodsPerWeek || 24;
      if (weeklyCount > maxWeekly) {
        conflicts.push({
          type: 'MAX_WEEKLY_WORKLOAD_EXCEEDED',
          severity: 'warning',
          teacherId: teacher.id,
          teacherName: teacher.name,
          message: `Teacher ${teacher.name} has ${weeklyCount} weekly periods assigned (Maximum limit: ${maxWeekly}).`,
          suggestion: `Rebalance workload among departmental colleagues.`
        });
      }
    });

    // Check Missing Requirements
    if (requirements && requirements.length > 0) {
      requirements.forEach(req => {
        const csKey = `${req.classId}-${req.subjectId}`;
        const actualCount = classSubjectWeeklyCount.get(csKey) || 0;
        if (actualCount < req.periodsPerWeek) {
          const sub = subjects.find(s => s.id === req.subjectId);
          conflicts.push({
            type: 'DEFICIT_PERIODS',
            severity: 'warning',
            classId: req.classId,
            subjectId: req.subjectId,
            message: `Class ${req.classId} has only ${actualCount}/${req.periodsPerWeek} weekly periods allocated for ${sub ? sub.name : req.subjectId}.`,
            suggestion: `Allocate remaining ${req.periodsPerWeek - actualCount} periods into free slots.`
          });
        }
      });
    }

    return {
      isValid: conflicts.filter(c => c.severity === 'error').length === 0,
      totalConflicts: conflicts.length,
      errorsCount: conflicts.filter(c => c.severity === 'error').length,
      warningsCount: conflicts.filter(c => c.severity === 'warning').length,
      conflicts
    };
  }

  /**
   * Automatic Timetable Generator
   * Uses constraint satisfaction with backtracking and period-splitting heuristics:
   * - Splits subject weekly requirements across available days (1 per day ideally)
   * - Allocates laboratories in consecutive blocks (e.g. 2 periods)
   * - Avoids teacher clashes
   * - Respects working days, daily period limits, and teacher preferences
   */
  static generateSchedule({ classes, subjects, teachers, laboratories, requirements, settings, preserveLocked = true, existingTimetable = [] }) {
    const workingDays = settings.workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const regularPeriods = settings.periodsPerDay || 8;
    const saturdayPeriods = settings.saturdayPeriods || 6;

    // Retain locked periods if requested
    const timetable = preserveLocked ? existingTimetable.filter(e => e.isLocked) : [];

    // Bookings index for rapid constraint verification
    // teacherBookings: Map(`${teacherId}-${day}-${period}` -> true)
    // classBookings: Map(`${classId}-${day}-${period}` -> true)
    // labBookings: Map(`${labId}-${day}-${period}` -> true)
    const teacherBookings = new Set();
    const classBookings = new Set();
    const labBookings = new Set();
    const teacherDailyLoad = new Map(); // `${teacherId}-${day}` -> count

    timetable.forEach(e => {
      const slot = `${e.day}-${e.period}`;
      if (e.teacherId) {
        teacherBookings.add(`${e.teacherId}-${slot}`);
        const dKey = `${e.teacherId}-${e.day}`;
        teacherDailyLoad.set(dKey, (teacherDailyLoad.get(dKey) || 0) + 1);
      }
      if (e.classId) classBookings.add(`${e.classId}-${slot}`);
      if (e.labId) labBookings.add(`${e.labId}-${slot}`);
    });

    const teacherMap = new Map(teachers.map(t => [t.id, t]));
    const subjectMap = new Map(subjects.map(s => [s.id, s]));
    const classMap = new Map(classes.map(c => [c.name, c]));

    // Helper: get period count for a day
    const getPeriodsForDay = (day) => (day === 'Saturday' ? saturdayPeriods : regularPeriods);

    // Group requirements by class
    const reqsByClass = new Map();
    requirements.forEach(req => {
      if (!reqsByClass.has(req.classId)) reqsByClass.set(req.classId, []);
      reqsByClass.get(req.classId).push(req);
    });

    // Helper: Find qualified teacher for subject and class
    const findTeacher = (req) => {
      if (req.teacherId) return teacherMap.get(req.teacherId);
      const sub = subjectMap.get(req.subjectId);
      if (!sub) return null;
      return teachers.find(t => 
        t.status === 'active' &&
        t.subjects.includes(sub.name) &&
        (t.classes.includes(req.classId) || t.classes.length === 0)
      ) || teachers.find(t => t.status === 'active' && t.subjects.includes(sub.name));
    };

    // Iterate through each class and allocate periods
    const unallocatedReqs = [];

    classes.forEach(cls => {
      const classId = cls.name;
      const classReqs = reqsByClass.get(classId) || [];

      // Sort requirements: Lab / Consecutive practicals first, then subjects with highest weekly periods
      const sortedReqs = [...classReqs].sort((a, b) => {
        const subA = subjectMap.get(a.subjectId);
        const subB = subjectMap.get(b.subjectId);
        const isLabA = (subA && subA.type === 'Lab') || a.isConsecutive;
        const isLabB = (subB && subB.type === 'Lab') || b.isConsecutive;
        if (isLabA && !isLabB) return -1;
        if (!isLabA && isLabB) return 1;
        return (b.periodsPerWeek || 0) - (a.periodsPerWeek || 0);
      });

      // Keep track of which days have this subject already assigned to avoid clustering
      const subjectDayCount = new Map(); // `${subjectId}-${day}` -> count

      sortedReqs.forEach(req => {
        const subject = subjectMap.get(req.subjectId);
        if (!subject) return;

        const assignedTeacher = findTeacher(req);
        const isLab = subject.type === 'Lab' || req.isConsecutive;
        const targetPeriods = req.periodsPerWeek || 4;
        let allocatedCount = 0;

        // Check how many already locked in existing timetable
        const alreadyAllocated = timetable.filter(e => e.classId === classId && e.subjectId === req.subjectId).length;
        allocatedCount += alreadyAllocated;

        if (isLab) {
          // Allocate Lab in pairs of 2 consecutive periods
          const labId = req.labId || subject.labId;

          for (const day of workingDays) {
            if (allocatedCount >= targetPeriods) break;
            const maxP = getPeriodsForDay(day);

            // Possible consecutive pairs: (1,2), (3,4), (5,6), (7,8)
            const pairStarts = [3, 5, 1, 7].filter(p => p + 1 <= maxP);

            for (const p1 of pairStarts) {
              const p2 = p1 + 1;
              const slot1 = `${day}-${p1}`;
              const slot2 = `${day}-${p2}`;

              // Check availability
              const classFree = !classBookings.has(`${classId}-${slot1}`) && !classBookings.has(`${classId}-${slot2}`);
              const teacherFree = !assignedTeacher || (
                !teacherBookings.has(`${assignedTeacher.id}-${slot1}`) && 
                !teacherBookings.has(`${assignedTeacher.id}-${slot2}`) &&
                (assignedTeacher.workingDays.includes(day))
              );
              const labFree = !labId || (!labBookings.has(`${labId}-${slot1}`) && !labBookings.has(`${labId}-${slot2}`));

              if (classFree && teacherFree && labFree) {
                // Book both slots
                [p1, p2].forEach(p => {
                  const s = `${day}-${p}`;
                  classBookings.add(`${classId}-${s}`);
                  if (assignedTeacher) {
                    teacherBookings.add(`${assignedTeacher.id}-${s}`);
                    const dKey = `${assignedTeacher.id}-${day}`;
                    teacherDailyLoad.set(dKey, (teacherDailyLoad.get(dKey) || 0) + 1);
                  }
                  if (labId) labBookings.add(`${labId}-${s}`);

                  timetable.push({
                    id: `TT-${classId}-${day.slice(0,3)}-P${p}-${Date.now().toString().slice(-4)}`,
                    classId,
                    day,
                    period: p,
                    shift: 'regular',
                    subjectId: req.subjectId,
                    subjectName: subject.name,
                    teacherId: assignedTeacher ? assignedTeacher.id : null,
                    teacherName: assignedTeacher ? assignedTeacher.name : 'Unassigned',
                    room: cls.room,
                    labId: labId || null,
                    isConsecutive: true
                  });
                });

                allocatedCount += 2;
                break; // One lab session per day
              }
            }
          }
        } else {
          // Normal Theory / Activity Subject
          // Distribute across days fairly: try days that don't have this subject yet
          const shuffledDays = [...workingDays].sort((d1, d2) => {
            const c1 = subjectDayCount.get(`${req.subjectId}-${d1}`) || 0;
            const c2 = subjectDayCount.get(`${req.subjectId}-${d2}`) || 0;
            return c1 - c2;
          });

          for (const day of shuffledDays) {
            if (allocatedCount >= targetPeriods) break;
            const maxP = getPeriodsForDay(day);

            // Preferred order of periods (interleaving core subjects in morning / midday)
            const preferredOrder = [1, 2, 3, 4, 5, 6, 7, 8].filter(p => p <= maxP);

            for (const p of preferredOrder) {
              if (allocatedCount >= targetPeriods) break;
              const slot = `${day}-${p}`;

              const classFree = !classBookings.has(`${classId}-${slot}`);
              if (!classFree) continue;

              let teacherFree = true;
              if (assignedTeacher) {
                const isWorkingDay = assignedTeacher.workingDays.includes(day);
                const hasTeacherClash = teacherBookings.has(`${assignedTeacher.id}-${slot}`);
                const currentDaily = teacherDailyLoad.get(`${assignedTeacher.id}-${day}`) || 0;
                const dailyLimitExceeded = currentDaily >= (assignedTeacher.maxPeriodsPerDay || 5);

                if (!isWorkingDay || hasTeacherClash || dailyLimitExceeded) {
                  teacherFree = false;
                }
              }

              if (classFree && teacherFree) {
                // Book slot
                classBookings.add(`${classId}-${slot}`);
                if (assignedTeacher) {
                  teacherBookings.add(`${assignedTeacher.id}-${slot}`);
                  const dKey = `${assignedTeacher.id}-${day}`;
                  teacherDailyLoad.set(dKey, (teacherDailyLoad.get(dKey) || 0) + 1);
                }

                subjectDayCount.set(`${req.subjectId}-${day}`, (subjectDayCount.get(`${req.subjectId}-${day}`) || 0) + 1);

                timetable.push({
                  id: `TT-${classId}-${day.slice(0,3)}-P${p}-${Date.now().toString().slice(-4)}`,
                  classId,
                  day,
                  period: p,
                  shift: 'regular',
                  subjectId: req.subjectId,
                  subjectName: subject.name,
                  teacherId: assignedTeacher ? assignedTeacher.id : null,
                  teacherName: assignedTeacher ? assignedTeacher.name : 'Unassigned',
                  room: cls.room
                });

                allocatedCount++;
                break; // Move to next day to spread subject across week evenly!
              }
            }
          }

          // If still remaining due to hard constraints, make a 2nd pass allowing a 2nd period in a day
          if (allocatedCount < targetPeriods) {
            for (const day of workingDays) {
              if (allocatedCount >= targetPeriods) break;
              const maxP = getPeriodsForDay(day);

              for (let p = 1; p <= maxP; p++) {
                if (allocatedCount >= targetPeriods) break;
                const slot = `${day}-${p}`;
                const classFree = !classBookings.has(`${classId}-${slot}`);
                if (!classFree) continue;

                let teacherFree = true;
                if (assignedTeacher) {
                  if (teacherBookings.has(`${assignedTeacher.id}-${slot}`)) teacherFree = false;
                  if (!assignedTeacher.workingDays.includes(day)) teacherFree = false;
                }

                if (classFree && teacherFree) {
                  classBookings.add(`${classId}-${slot}`);
                  if (assignedTeacher) {
                    teacherBookings.add(`${assignedTeacher.id}-${slot}`);
                    const dKey = `${assignedTeacher.id}-${day}`;
                    teacherDailyLoad.set(dKey, (teacherDailyLoad.get(dKey) || 0) + 1);
                  }

                  timetable.push({
                    id: `TT-${classId}-${day.slice(0,3)}-P${p}-${Date.now().toString().slice(-4)}`,
                    classId,
                    day,
                    period: p,
                    shift: 'regular',
                    subjectId: req.subjectId,
                    subjectName: subject.name,
                    teacherId: assignedTeacher ? assignedTeacher.id : null,
                    teacherName: assignedTeacher ? assignedTeacher.name : 'Unassigned',
                    room: cls.room
                  });

                  allocatedCount++;
                }
              }
            }
          }
        }

        if (allocatedCount < targetPeriods) {
          unallocatedReqs.push({
            classId,
            subjectId: req.subjectId,
            subjectName: subject.name,
            demanded: targetPeriods,
            allocated: allocatedCount,
            deficit: targetPeriods - allocatedCount
          });
        }
      });
    });

    // Run conflict engine on the freshly generated schedule
    const validation = TimetableEngine.validateTimetable(
      timetable,
      teachers,
      classes,
      subjects,
      laboratories,
      requirements,
      [],
      []
    );

    return {
      success: true,
      generatedTimetable: timetable,
      totalAssignedPeriods: timetable.length,
      unallocatedCount: unallocatedReqs.length,
      unallocatedReqs,
      validation
    };
  }

  /**
   * Automatic Substitution Recommender
   * When a teacher is absent:
   * 1. Finds all periods the teacher was scheduled for on that day
   * 2. For each period, evaluates free eligible teachers
   * 3. Ranks candidates by subject match, department match, class eligibility, and current daily workload
   */
  static getSubstitutionRecommendations(absentTeacherId, day, timetable, teachers, leaves = [], substitutions = []) {
    const absentTeacher = teachers.find(t => t.id === absentTeacherId);
    if (!absentTeacher) return { error: "Teacher not found" };

    // 1. Affected periods on the given day
    const affectedPeriods = timetable.filter(e => 
      (e.teacherId === absentTeacherId || e.substitutedTeacherId === absentTeacherId) &&
      e.day === day
    );

    // Set of teachers on leave on this day
    const absentTeacherIds = new Set(leaves.filter(l => !l.day || l.day === day).map(l => l.teacherId));
    absentTeacherIds.add(absentTeacherId);

    // Compute today's current load for all teachers
    const dailyLoad = new Map();
    timetable.forEach(e => {
      if (e.day === day) {
        const tid = e.substitutedTeacherId || e.teacherId;
        if (tid) dailyLoad.set(tid, (dailyLoad.get(tid) || 0) + 1);
      }
    });

    const recommendationsByPeriod = affectedPeriods.map(entry => {
      const { period, classId, subjectId, subjectName } = entry;

      // Find who is booked at this exact period
      const busyTeacherIds = new Set();
      timetable.forEach(e => {
        if (e.day === day && String(e.period) === String(period)) {
          const tid = e.substitutedTeacherId || e.teacherId;
          if (tid) busyTeacherIds.add(tid);
        }
      });

      // Filter available candidates
      const candidates = teachers
        .filter(t => 
          t.status === 'active' &&
          !absentTeacherIds.has(t.id) &&
          !busyTeacherIds.has(t.id) &&
          t.workingDays.includes(day)
        )
        .map(teacher => {
          let score = 0;
          const reasons = [];

          // Subject match (Highest priority)
          if (teacher.subjects.includes(subjectName)) {
            score += 100;
            reasons.push("Specialist in " + subjectName);
          }

          // Department match
          if (teacher.department === absentTeacher.department) {
            score += 50;
            reasons.push("Same department (" + teacher.department + ")");
          }

          // Class eligibility match
          if (teacher.classes.includes(classId)) {
            score += 30;
            reasons.push("Already teaches Class " + classId);
          }

          // Daily workload fairness
          const currentPeriods = dailyLoad.get(teacher.id) || 0;
          const maxPeriods = teacher.maxPeriodsPerDay || 5;
          const freePeriods = Math.max(0, maxPeriods - currentPeriods);

          score += freePeriods * 5;

          if (currentPeriods < maxPeriods) {
            reasons.push(`${currentPeriods}/${maxPeriods} periods scheduled today`);
          } else {
            score -= 40;
            reasons.push(`At maximum daily workload (${maxPeriods} periods)`);
          }

          return {
            teacherId: teacher.id,
            staffId: teacher.staffId,
            teacherName: teacher.name,
            department: teacher.department,
            currentDailyWorkload: currentPeriods,
            maxPeriodsPerDay: maxPeriods,
            isSubjectSpecialist: teacher.subjects.includes(subjectName),
            score,
            reasons
          };
        })
        .sort((a, b) => b.score - a.score);

      return {
        timetableEntryId: entry.id,
        period,
        classId,
        subjectId,
        subjectName,
        room: entry.room,
        currentSubstitution: substitutions.find(s => s.day === day && String(s.period) === String(period) && s.classId === classId),
        candidates
      };
    });

    return {
      absentTeacher,
      day,
      totalAffectedPeriods: affectedPeriods.length,
      recommendationsByPeriod
    };
  }
}
