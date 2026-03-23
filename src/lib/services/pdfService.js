import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const pdfService = {
	/**
	 * Generate schedule PDF for all categories
	 */
	generateSchedulePDF(scheduleData, scores = {}) {
		const doc = new jsPDF('landscape');
		
		// Title
		doc.setFontSize(20);
		doc.text("YADIKA CUP BASKETBALL CHAMPIONSHIP", 148, 15, { align: "center" });
		doc.setFontSize(16);
		doc.text("Tournament Schedule", 148, 25, { align: "center" });
		doc.setFontSize(10);
		doc.text(`Generated: ${new Date().toLocaleString()}`, 148, 32, { align: "center" });

		// Group by day
		const groupedByDay = {};
		scheduleData.forEach(match => {
			if (!groupedByDay[match.day]) groupedByDay[match.day] = [];
			groupedByDay[match.day].push(match);
		});

		let startY = 45;

		Object.keys(groupedByDay).sort((a, b) => parseInt(a) - parseInt(b)).forEach(day => {
			const dayMatches = groupedByDay[day];
			
			// Day header
			doc.setFontSize(14);
			doc.setFont('helvetica', 'bold');
			doc.text(`Day ${day} - ${this.getActualDate(parseInt(day))}`, 20, startY);
			
			// Round info
			const roundInfo = this.getRoundInfo(parseInt(day));
			doc.setFontSize(10);
			doc.setFont('helvetica', 'normal');
			doc.text(roundInfo.label, 20, startY + 7);
			
			startY += 15;

			// Matches table
			const tableData = dayMatches.map(match => {
				const scoreKey = `${match.day}-${match.matchStrId}-${match.category}`;
				const score = scores[scoreKey];
				const scoreText = score ? `${score.score1} - ${score.score2}` : '-';
				
				return [
					match.matchStrId,
					match.time,
					match.category,
					match.team1,
					'VS',
					match.team2,
					scoreText
				];
			});

			autoTable(doc, {
				startY: startY,
				head: [['Match', 'Time', 'Category', 'Team 1', '', 'Team 2', 'Score']],
				body: tableData,
				theme: 'striped',
				headStyles: { 
					fillColor: [79, 70, 229], 
					textColor: 255,
					fontSize: 9,
					fontStyle: 'bold'
				},
				styles: { 
					font: 'helvetica', 
					fontSize: 8, 
					cellPadding: 2
				},
				columnStyles: {
					0: { cellWidth: 20, halign: 'center' },
					1: { cellWidth: 25, halign: 'center' },
					2: { cellWidth: 30, halign: 'center' },
					3: { cellWidth: 'auto', fontStyle: 'bold' },
					4: { cellWidth: 15, halign: 'center', textColor: [150, 150, 150] },
					5: { cellWidth: 'auto', fontStyle: 'bold' },
					6: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
				},
				margin: { left: 20, right: 20 }
			});

			startY = doc.lastAutoTable.finalY + 15;

			// Add new page if needed
			if (startY > 180) {
				doc.addPage();
				startY = 20;
			}
		});

		doc.save('Yadika_Cup_Schedule.pdf');
	},

	/**
	 * Generate bracket PDF for specific category
	 */
	generateBracketPDF(category, matches, scores = {}) {
		const doc = new jsPDF();
		
		// Title
		doc.setFontSize(20);
		doc.text("YADIKA CUP BASKETBALL CHAMPIONSHIP", 105, 15, { align: "center" });
		doc.setFontSize(16);
		doc.text(`Tournament Bracket - ${category}`, 105, 25, { align: "center" });
		doc.setFontSize(10);
		doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 32, { align: "center" });

		// Round of 16
		let startY = 45;
		doc.setFontSize(12);
		doc.setFont('helvetica', 'bold');
		doc.text('Round of 16', 105, startY, { align: "center" });
		startY += 10;

		const roundOf16Data = matches.slice(0, 8).map((match, i) => {
			const scoreKey = `${this.getMatchDay(category, i)}-M${i + 1}-${category}`;
			const score = scores[scoreKey];
			const scoreText = score ? `${score.score1} - ${score.score2}` : 'TBD';
			
			return [
				`M${i + 1}`,
				match.team1 || 'TBD',
				'VS',
				match.team2 || 'TBD',
				scoreText
			];
		});

		autoTable(doc, {
			startY: startY,
			head: [['Match', 'Team 1', '', 'Team 2', 'Score']],
			body: roundOf16Data,
			theme: 'striped',
			headStyles: { fillColor: [79, 70, 229], textColor: 255 },
			styles: { font: 'helvetica', fontSize: 10, cellPadding: 3 },
			columnStyles: {
				0: { cellWidth: 20, halign: 'center' },
				1: { cellWidth: 'auto', fontStyle: 'bold' },
				2: { cellWidth: 15, halign: 'center', textColor: [150, 150, 150] },
				3: { cellWidth: 'auto', fontStyle: 'bold' },
				4: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
			}
		});

		// Quarter Finals, Semi Finals, Finals sections
		startY = doc.lastAutoTable.finalY + 15;
		
		const rounds = [
			{ name: 'Quarter Finals', matches: 4, startIndex: 8 },
			{ name: 'Semi Finals', matches: 2, startIndex: 12 },
			{ name: 'Grand Final', matches: 1, startIndex: 14 }
		];

		rounds.forEach(round => {
			doc.setFontSize(12);
			doc.setFont('helvetica', 'bold');
			doc.text(round.name, 105, startY, { align: "center" });
			startY += 10;

			const roundData = [];
			for (let i = 0; i < round.matches; i++) {
				const matchIndex = round.startIndex + i;
				const scoreKey = `${this.getMatchDay(category, matchIndex)}-M${matchIndex + 1}-${category}`;
				const score = scores[scoreKey];
				const scoreText = score ? `${score.score1} - ${score.score2}` : 'TBD';
				
				roundData.push([
					`${round.name === 'Grand Final' ? 'FINAL' : round.name.substring(0, 2) + (i + 1)}`,
					'Winner from previous round',
					'VS',
					'Winner from previous round',
					scoreText
				]);
			}

			autoTable(doc, {
				startY: startY,
				head: [['Match', 'Team 1', '', 'Team 2', 'Score']],
				body: roundData,
				theme: 'striped',
				headStyles: { fillColor: [79, 70, 229], textColor: 255 },
				styles: { font: 'helvetica', fontSize: 10, cellPadding: 3 },
				columnStyles: {
					0: { cellWidth: 20, halign: 'center' },
					1: { cellWidth: 'auto', fontStyle: 'bold' },
					2: { cellWidth: 15, halign: 'center', textColor: [150, 150, 150] },
					3: { cellWidth: 'auto', fontStyle: 'bold' },
					4: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
				}
			});

			startY = doc.lastAutoTable.finalY + 15;
		});

		doc.save(`Bracket_${category.replace(' ', '_')}.pdf`);
	},

	/**
	 * Helper functions
	 */
	getActualDate(dayNum) {
		const startDate = new Date('2025-05-10');
		startDate.setDate(startDate.getDate() + (dayNum - 1));
		return startDate.toLocaleDateString('id-ID', { 
			weekday: 'long', 
			day: 'numeric', 
			month: 'long', 
			year: 'numeric' 
		});
	},

	getRoundInfo(day) {
		if (day === 13) return { label: 'Grand Final' };
		if (day >= 11) return { label: 'Semi Final' };
		if (day >= 7) return { label: 'Quarter Final' };
		return { label: 'Round of 16' };
	},

	getMatchDay(category, matchIndex) {
		// Simplified - you might want to use the actual getMatchDay function
		return Math.floor(matchIndex / 4) + 1;
	}
};