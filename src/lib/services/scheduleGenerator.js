/**
 * Schedule Generator
 * Generates match schedule from draw results
 */

import { getMatchTime } from '$lib/utils/match.js';

export async function generateScheduleData() {
	const loadedData = [];
	const categories = [
		{ key: 'sma-putra', level: 'SMA', gender: 'Putra' },
		{ key: 'sma-putri', level: 'SMA', gender: 'Putri' },
		{ key: 'smp-putra', level: 'SMP', gender: 'Putra' },
		{ key: 'smp-putri', level: 'SMP', gender: 'Putri' }
	];

	const allMatchResults = {};
	
	// Fetch draw results from database for each category
	for (const cat of categories) {
		try {
			const response = await fetch(`/api/draw/${cat.key}/results`);
			const result = await response.json();
			if (result.success && result.data) {
				allMatchResults[cat.key] = result.data;
			} else {
				allMatchResults[cat.key] = Array(8).fill(null).map(() => ({ team1: 'TBD', team2: 'TBD' }));
			}
		} catch (error) {
			console.error(`Failed to fetch ${cat.key} results:`, error);
			allMatchResults[cat.key] = Array(8).fill(null).map(() => ({ team1: 'TBD', team2: 'TBD' }));
		}
	}

	// Fetch scores for winner resolution
	let matchScores = {};
	try {
		const scoresResponse = await fetch('/api/schedule?scores=true');
		const scoresJson = await scoresResponse.json();
		if (scoresJson.success) {
			matchScores = scoresJson.data;
		}
	} catch (error) {
		console.error('Failed to fetch scores for winner resolution:', error);
	}

	let matchIdCounter = 1;

	// Helper to get winner
	const getWinner = (day, matchStrId, category) => {
		const key = `${day}-${matchStrId}-${category.toLowerCase().replace(' ', '-')}`;
		const score = matchScores[key];
		if (!score) return null;

		const match = loadedData.find(m => m.day === day && m.matchStrId === matchStrId && m.category === category);
		if (!match) return null;

		if (score.score1 > score.score2) return match.team1;
		if (score.score2 > score.score1) return match.team2;
		return null;
	};
	
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

	// Day 1: SMA (5 matches)
	addMatch(1, 'M01', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][0]);
	addMatch(1, 'M02', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][1]);
	addMatch(1, 'M03', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][2]);
	addMatch(1, 'M01', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][0]);
	addMatch(1, 'M02', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][1]);

	// Day 2: SMP (5 matches)
	addMatch(2, 'M01', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][0]);
	addMatch(2, 'M02', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][1]);
	addMatch(2, 'M03', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][2]);
	addMatch(2, 'M01', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][0]);
	addMatch(2, 'M02', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][1]);

	// Day 3: SMA (5 matches)
	addMatch(3, 'M04', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][3]);
	addMatch(3, 'M05', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][4]);
	addMatch(3, 'M03', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][2]);
	addMatch(3, 'M04', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][3]);
	addMatch(3, 'M05', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][4]);

	// Day 4: SMP (5 matches)
	addMatch(4, 'M04', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][3]);
	addMatch(4, 'M05', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][4]);
	addMatch(4, 'M03', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][2]);
	addMatch(4, 'M04', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][3]);
	addMatch(4, 'M05', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][4]);

	// Day 5: SMA (6 matches)
	addMatch(5, 'M06', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][5]);
	addMatch(5, 'M07', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][6]);
	addMatch(5, 'M08', 'Round of 16', 'SMA', 'Putra', allMatchResults['sma-putra'][7]);
	addMatch(5, 'M06', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][5]);
	addMatch(5, 'M07', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][6]);
	addMatch(5, 'M08', 'Round of 16', 'SMA', 'Putri', allMatchResults['sma-putri'][7]);

	// Day 6: SMP (6 matches)
	addMatch(6, 'M06', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][5]);
	addMatch(6, 'M07', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][6]);
	addMatch(6, 'M08', 'Round of 16', 'SMP', 'Putra', allMatchResults['smp-putra'][7]);
	addMatch(6, 'M06', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][5]);
	addMatch(6, 'M07', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][6]);
	addMatch(6, 'M08', 'Round of 16', 'SMP', 'Putri', allMatchResults['smp-putri'][7]);

	// Bracket matches (8 Besar - Day 7-10)
	const resolveBracket = (match) => {
		if (match.round === 'Quarter Final') {
			const m1Str = `M${String(parseInt(match.matchStrId.replace('QF', '')) * 2 - 1).padStart(2, '0')}`;
			const m2Str = `M${String(parseInt(match.matchStrId.replace('QF', '')) * 2).padStart(2, '0')}`;
			const m1Day = loadedData.find(m => m.matchStrId === m1Str && m.category === match.category)?.day;
			const m2Day = loadedData.find(m => m.matchStrId === m2Str && m.category === match.category)?.day;
			match.team1 = getWinner(m1Day, m1Str, match.category) || `Winner ${m1Str}`;
			match.team2 = getWinner(m2Day, m2Str, match.category) || `Winner ${m2Str}`;
		} else if (match.round === 'Semi Final') {
			const qf1Str = 'QF01', qf2Str = 'QF02', qf3Str = 'QF03', qf4Str = 'QF04';
			const qf1Day = loadedData.find(m => m.matchStrId === qf1Str && m.category === match.category)?.day;
			const qf2Day = loadedData.find(m => m.matchStrId === qf2Str && m.category === match.category)?.day;
			const qf3Day = loadedData.find(m => m.matchStrId === qf3Str && m.category === match.category)?.day;
			const qf4Day = loadedData.find(m => m.matchStrId === qf4Str && m.category === match.category)?.day;
			if (match.matchStrId === 'SF01') {
				match.team1 = getWinner(qf1Day, qf1Str, match.category) || `Winner ${qf1Str}`;
				match.team2 = getWinner(qf2Day, qf2Str, match.category) || `Winner ${qf2Str}`;
			} else {
				match.team1 = getWinner(qf3Day, qf3Str, match.category) || `Winner ${qf3Str}`;
				match.team2 = getWinner(qf4Day, qf4Str, match.category) || `Winner ${qf4Str}`;
			}
		} else if (match.round === 'Grand Final') {
			const sf1Str = 'SF01', sf2Str = 'SF02';
			const sf1Day = loadedData.find(m => m.matchStrId === sf1Str && m.category === match.category)?.day;
			const sf2Day = loadedData.find(m => m.matchStrId === sf2Str && m.category === match.category)?.day;
			match.team1 = getWinner(sf1Day, sf1Str, match.category) || `Winner ${sf1Str}`;
			match.team2 = getWinner(sf2Day, sf2Str, match.category) || `Winner ${sf2Str}`;
		}
	};

	// Add bracket rounds
	addMatch(7, 'QF01', 'Quarter Final', 'SMA', 'Putra', null);
	addMatch(7, 'QF02', 'Quarter Final', 'SMA', 'Putra', null);
	addMatch(7, 'QF01', 'Quarter Final', 'SMA', 'Putri', null);
	addMatch(7, 'QF02', 'Quarter Final', 'SMA', 'Putri', null);

	addMatch(8, 'QF01', 'Quarter Final', 'SMP', 'Putra', null);
	addMatch(8, 'QF02', 'Quarter Final', 'SMP', 'Putra', null);
	addMatch(8, 'QF01', 'Quarter Final', 'SMP', 'Putri', null);
	addMatch(8, 'QF02', 'Quarter Final', 'SMP', 'Putri', null);

	addMatch(9, 'QF03', 'Quarter Final', 'SMA', 'Putra', null);
	addMatch(9, 'QF04', 'Quarter Final', 'SMA', 'Putra', null);
	addMatch(9, 'QF03', 'Quarter Final', 'SMA', 'Putri', null);
	addMatch(9, 'QF04', 'Quarter Final', 'SMA', 'Putri', null);

	addMatch(10, 'QF03', 'Quarter Final', 'SMP', 'Putra', null);
	addMatch(10, 'QF04', 'Quarter Final', 'SMP', 'Putra', null);
	addMatch(10, 'QF03', 'Quarter Final', 'SMP', 'Putri', null);
	addMatch(10, 'QF04', 'Quarter Final', 'SMP', 'Putri', null);

	addMatch(11, 'SF01', 'Semi Final', 'SMA', 'Putra', null);
	addMatch(11, 'SF02', 'Semi Final', 'SMA', 'Putra', null);
	addMatch(11, 'SF01', 'Semi Final', 'SMA', 'Putri', null);
	addMatch(11, 'SF02', 'Semi Final', 'SMA', 'Putri', null);

	addMatch(12, 'SF01', 'Semi Final', 'SMP', 'Putra', null);
	addMatch(12, 'SF02', 'Semi Final', 'SMP', 'Putra', null);
	addMatch(12, 'SF01', 'Semi Final', 'SMP', 'Putri', null);
	addMatch(12, 'SF02', 'Semi Final', 'SMP', 'Putri', null);

	addMatch(13, 'GF', 'Grand Final', 'SMP', 'Putri', null);
	addMatch(13, 'GF', 'Grand Final', 'SMP', 'Putra', null);
	addMatch(13, 'GF', 'Grand Final', 'SMA', 'Putri', null);
	addMatch(13, 'GF', 'Grand Final', 'SMA', 'Putra', null);

	// Resolve winner team names for bracket matches
	loadedData.forEach(match => {
		if (match.round !== 'Round of 16') resolveBracket(match);
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

		return { ...match, time };
	});
}

