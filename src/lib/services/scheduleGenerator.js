/**
 * Schedule Generator
 * Generates match schedule from draw results
 */

import { storage } from '$lib/utils/storage.js';
import { getMatchTime } from '$lib/utils/match.js';

export function generateScheduleData() {
	const loadedData = [];
	const categories = [
		{ key: 'sma-putra', level: 'SMA', gender: 'Putra' },
		{ key: 'sma-putri', level: 'SMA', gender: 'Putri' },
		{ key: 'smp-putra', level: 'SMP', gender: 'Putra' },
		{ key: 'smp-putri', level: 'SMP', gender: 'Putri' }
	];

	const allMatchResults = {};
	categories.forEach(cat => {
		const saved = storage.get(`results_${cat.key}`);
		if (saved) {
			allMatchResults[cat.key] = saved;
		} else {
			allMatchResults[cat.key] = Array(8).fill(null).map(() => ({ team1: 'TBD', team2: 'TBD' }));
		}
	});

	let matchIdCounter = 1;
	
	const addMatch = (day, matchStrId, round, level, gender, matchData) => {
		loadedData.push({
			id: matchIdCounter++,
			day,
			matchStrId,
			round,
			level,
			gender,
			category: `${level} ${gender}`,
			team1: matchData && matchData.team1 !== '?' ? matchData.team1 : 'TBD',
			team2: matchData && matchData.team2 !== '?' ? matchData.team2 : 'TBD'
		});
	};

	// Day 1-6: Round of 16
	addMatch(1, 'M01', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][0]);
	addMatch(1, 'M02', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][1]);
	addMatch(1, 'M03', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][2]);
	addMatch(1, 'M01', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][0]);
	addMatch(1, 'M02', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][1]);

	addMatch(2, 'M01', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][0]);
	addMatch(2, 'M02', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][1]);
	addMatch(2, 'M03', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][2]);
	addMatch(2, 'M01', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][0]);
	addMatch(2, 'M02', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][1]);

	addMatch(3, 'M04', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][3]);
	addMatch(3, 'M05', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][4]);
	addMatch(3, 'M03', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][2]);
	addMatch(3, 'M04', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][3]);
	addMatch(3, 'M05', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][4]);

	addMatch(4, 'M04', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][3]);
	addMatch(4, 'M05', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][4]);
	addMatch(4, 'M03', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][2]);
	addMatch(4, 'M04', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][3]);
	addMatch(4, 'M05', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][4]);

	addMatch(5, 'M06', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][5]);
	addMatch(5, 'M07', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][6]);
	addMatch(5, 'M08', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][7]);
	addMatch(5, 'M06', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][5]);
	addMatch(5, 'M07', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][6]);
	addMatch(5, 'M08', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][7]);

	addMatch(6, 'M06', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][5]);
	addMatch(6, 'M07', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][6]);
	addMatch(6, 'M08', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][7]);
	addMatch(6, 'M06', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][5]);
	addMatch(6, 'M07', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][6]);
	addMatch(6, 'M08', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][7]);

	// Day 7-10: Quarter Finals
	['SMA', 'SMP'].forEach((level, levelIdx) => {
		[7, 9].forEach((day, dayIdx) => {
			['Putra', 'Putri'].forEach(gender => {
				const qfNum = dayIdx * 2 + 1;
				addMatch(day + levelIdx, `QF0${qfNum}`, 'Quarter Final', level, gender, null);
				addMatch(day + levelIdx, `QF0${qfNum + 1}`, 'Quarter Final', level, gender, null);
			});
		});
	});

	// Day 11-12: Semi Finals
	[11, 12].forEach((day, idx) => {
		const level = idx === 0 ? 'SMA' : 'SMP';
		['Putra', 'Putri'].forEach(gender => {
			addMatch(day, 'SF01', 'Semi Final', level, gender, null);
			addMatch(day, 'SF02', 'Semi Final', level, gender, null);
		});
	});

	// Day 13: Grand Finals
	['SMP', 'SMA'].forEach(level => {
		['Putri', 'Putra'].forEach(gender => {
			addMatch(13, 'GF', 'Grand Final', level, gender, null);
		});
	});

	// Calculate times and set placeholder teams
	return loadedData.map((match, i) => {
		let time;
		
		if (match.round === 'Quarter Final') {
			const isPutra = match.gender === 'Putra';
			const qfTimes = ['15.30 - 16.30', '16.30 - 17.30', '19.00 - 20.00', '20.00 - 21.00'];
			const isFirstPair = match.matchStrId === 'QF01' || match.matchStrId === 'QF02';
			time = isPutra ? 
				(isFirstPair ? qfTimes[2] : qfTimes[3]) : 
				(isFirstPair ? qfTimes[0] : qfTimes[1]);
		} else if (match.round === 'Semi Final') {
			const sfTimes = ['15.30 - 16.30', '16.30 - 17.30', '19.00 - 20.00', '20.00 - 21.00'];
			const isPutra = match.gender === 'Putra';
			time = isPutra ? 
				(match.matchStrId === 'SF01' ? sfTimes[2] : sfTimes[3]) : 
				(match.matchStrId === 'SF01' ? sfTimes[0] : sfTimes[1]);
		} else if (match.round === 'Grand Final') {
			if (match.category === 'SMP Putri') time = '15.30 - 16.30';
			if (match.category === 'SMP Putra') time = '16.30 - 17.30';
			if (match.category === 'SMA Putri') time = '19.00 - 20.00';
			if (match.category === 'SMA Putra') time = '20.00 - 21.00';
		} else {
			const getMatchIndexInDay = (matches, currentMatch) => {
				let count = 0;
				for (const m of matches) {
					if (m === currentMatch) break;
					if (m.day === currentMatch.day) count++;
				}
				return count;
			};
			const indexInDay = getMatchIndexInDay(loadedData, match);
			time = getMatchTime(match.day, indexInDay);
		}

		if (match.team1 === 'TBD' || match.team1 === '?') {
			if (match.round === 'Quarter Final') {
				if (match.matchStrId === 'QF01') { match.team1 = 'Winner M01'; match.team2 = 'Winner M02'; }
				if (match.matchStrId === 'QF02') { match.team1 = 'Winner M03'; match.team2 = 'Winner M04'; }
				if (match.matchStrId === 'QF03') { match.team1 = 'Winner M05'; match.team2 = 'Winner M06'; }
				if (match.matchStrId === 'QF04') { match.team1 = 'Winner M07'; match.team2 = 'Winner M08'; }
			}
			if (match.round === 'Semi Final') {
				if (match.matchStrId === 'SF01') { match.team1 = 'Winner QF01'; match.team2 = 'Winner QF02'; }
				if (match.matchStrId === 'SF02') { match.team1 = 'Winner QF03'; match.team2 = 'Winner QF04'; }
			}
			if (match.round === 'Grand Final') {
				match.team1 = 'Winner SF01'; match.team2 = 'Winner SF02';
			}
		}

		return { ...match, time };
	});
}
