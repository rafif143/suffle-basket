/**
 * Match scheduling utilities
 */

export function getMatchTime(day, matchIndexInDay) {
	const standardTimes = [
		'15.30 - 16.30',
		'16.30 - 17.30',
		'17.45 - 18.45',
		'18.45 - 19.45',
		'19.45 - 20.45'
	];

	const day5or6Times = [
		'14.30 - 15.30',
		'15.30 - 16.30',
		'16.30 - 17.30',
		'17.45 - 18.45',
		'18.45 - 19.45',
		'19.45 - 20.45'
	];

	const day7PlusTimes = [
		'15.30 - 16.30',
		'16.30 - 17.30',
		'19.00 - 20.00',
		'20.00 - 21.00'
	];

	const times = day >= 7 ? day7PlusTimes : (day === 5 || day === 6) ? day5or6Times : standardTimes;
	return times[matchIndexInDay] || 'TBD';
}

export function getMatchDay(level, gender, matchIndex) {
	if (matchIndex < 0) return '';
	const baseDays = level === 'SMA' ? [1, 3, 5] : [2, 4, 6];

	if (gender === 'Putra') {
		if (matchIndex < 3) return baseDays[0];
		if (matchIndex < 5) return baseDays[1];
		return baseDays[2];
	} else {
		if (matchIndex < 2) return baseDays[0];
		if (matchIndex < 5) return baseDays[1];
		return baseDays[2];
	}
}

export function getMatchIndexInDay(level, gender, matchIndex) {
	const day = getMatchDay(level, gender, matchIndex);
	let count = 0;
	for (let i = 0; i < matchIndex; i++) {
		if (getMatchDay(level, gender, i) === day) {
			count++;
		}
	}
	return count;
}

export function getActualDate(dayNum) {
	const startDate = new Date('2025-05-10');
	startDate.setDate(startDate.getDate() + (dayNum - 1));
	return startDate.toLocaleDateString('id-ID', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
}
