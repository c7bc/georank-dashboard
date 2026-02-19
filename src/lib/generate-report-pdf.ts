import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';
import type { ReportDetailResponse, ReportSection, ReportPlatformInsight, ReportBenchmark, ReportMarketTrend, ReportCompetitorIntel } from '@/types';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
  }
}

// ─── THEME COLORS (Zinc / Dark) ──────────────────────────────────────────────
const COLORS = {
  bg: '#09090b',         // zinc-950
  card: '#18181b',       // zinc-900
  cardBorder: '#27272a', // zinc-800
  text: '#fafafa',       // zinc-50
  textMuted: '#a1a1aa',  // zinc-400
  primary: '#fafafa',    // white
  accent: '#27272a',     // zinc-800
  success: '#10b981',    // emerald-500
  warning: '#f59e0b',    // amber-500
  danger: '#ef4444',     // red-500
  chart: ['#e76e50', '#2a9d8f', '#264653', '#e9c46a', '#f4a261'],
};

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const MARGIN = 15;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

const drawCard = (doc: jsPDF, x: number, y: number, w: number, h: number) => {
  doc.setFillColor(COLORS.card);
  doc.setDrawColor(COLORS.cardBorder);
  doc.roundedRect(x, y, w, h, 2, 2, 'FD');
};

const drawText = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options: { size?: number; color?: string; align?: 'left' | 'center' | 'right'; style?: 'normal' | 'bold' } = {}
) => {
  const { size = 10, color = COLORS.text, align = 'left', style = 'normal' } = options;
  doc.setFontSize(size);
  doc.setTextColor(color);
  doc.setFont('helvetica', style);
  doc.text(text, x, y, { align });
};

const addPageBackground = (doc: jsPDF) => {
  doc.setFillColor(COLORS.bg);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
};

const getScoreColor = (score: number) => {
  if (score >= 70) return COLORS.success;
  if (score >= 50) return COLORS.warning;
  return COLORS.danger;
};

// ─── GENERATOR ───────────────────────────────────────────────────────────────

export async function generateReportPDF(
  data: ReportDetailResponse,
  filename: string
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let yPos = MARGIN;

  // Initial setup
  addPageBackground(doc);

  // 1. Header
  const domain = data.meta?.domain ?? data.name ?? 'Report';
  const type = (data.type || 'REPORT').toUpperCase();
  const date = data.generated_at ? new Date(data.generated_at).toLocaleDateString() : new Date().toLocaleDateString();

  drawText(doc, domain, MARGIN, yPos + 5, { size: 18, style: 'bold' });
  drawText(doc, `${type} • ${date}`, PAGE_WIDTH - MARGIN, yPos + 5, { size: 10, align: 'right', color: COLORS.textMuted });
  
  yPos += 15;

  // 2. Score Section
  const geoScore = data.meta?.geo_score ?? 0;
  const scoreColor = getScoreColor(geoScore);

  // Card background for score
  drawCard(doc, MARGIN, yPos, CONTENT_WIDTH, 40);
  
  // Score Label
  drawText(doc, 'GEO SCORE', MARGIN + 10, yPos + 10, { size: 8, color: COLORS.textMuted, style: 'bold' });
  
  // Large Score
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(scoreColor);
  doc.text(`${geoScore}`, MARGIN + 10, yPos + 25);
  
  // /100
  drawText(doc, '/100', MARGIN + 10 + doc.getTextWidth(`${geoScore}`) + 2, yPos + 25, { size: 12, color: COLORS.textMuted });

  // Progress Bar
  const barX = MARGIN + 10;
  const barY = yPos + 32;
  const barWidth = CONTENT_WIDTH - 20;
  
  // Track
  doc.setFillColor(COLORS.accent);
  doc.roundedRect(barX, barY, barWidth, 4, 2, 2, 'F');
  
  // Fill
  doc.setFillColor(scoreColor);
  doc.roundedRect(barX, barY, (barWidth * geoScore) / 100, 4, 2, 2, 'F');

  yPos += 50;

  // 3. Key Metrics (Grid of 3)
  const metrics = [
    { label: 'Mention Rate', value: `${(data.meta?.mention_rate ?? 0).toFixed(1)}%` },
    { label: 'Keywords', value: `${data.meta?.keyword_count ?? 0}` },
    { label: 'Platforms', value: `${(data.platform_insights?.length || 4)}` },
  ];

  const cardWidth = (CONTENT_WIDTH - 10) / 3;
  
  metrics.forEach((m, i) => {
    const x = MARGIN + (i * (cardWidth + 5));
    drawCard(doc, x, yPos, cardWidth, 30);
    drawText(doc, m.label.toUpperCase(), x + 5, yPos + 8, { size: 8, color: COLORS.textMuted, style: 'bold' });
    drawText(doc, m.value, x + 5, yPos + 22, { size: 16, style: 'bold' });
  });

  yPos += 40;

  // 4. Executive Summary
  const execSummary = data.sections?.find((s) => s.section_type === 'executive_summary')?.content;
  if (execSummary) {
    drawText(doc, 'EXECUTIVE SUMMARY', MARGIN, yPos, { size: 10, style: 'bold', color: COLORS.textMuted });
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(COLORS.text);
    const splitText = doc.splitTextToSize(execSummary, CONTENT_WIDTH);
    doc.text(splitText, MARGIN, yPos);
    yPos += splitText.length * 5 + 10;
  }

  // 4.1 Performance Analysis & Other Sections
  const otherSections = data.sections?.filter(s => 
    s.section_type !== 'executive_summary' && 
    s.section_type !== 'platform_breakdown' && 
    s.section_type !== 'competitive_landscape' &&
    s.section_type !== 'risks_threats' &&
    s.section_type !== 'recommendations'
  ) ?? [];

  otherSections.forEach(section => {
    if (yPos > PAGE_HEIGHT - 60) {
      doc.addPage();
      addPageBackground(doc);
      yPos = MARGIN;
    }

    drawText(doc, section.title.toUpperCase(), MARGIN, yPos, { size: 10, style: 'bold', color: COLORS.textMuted });
    yPos += 8;

    doc.setFontSize(10);
    doc.setTextColor(COLORS.text);
    const splitText = doc.splitTextToSize(section.content, CONTENT_WIDTH);
    doc.text(splitText, MARGIN, yPos);
    yPos += splitText.length * 5 + 15;
  });

  // 5. Platform Breakdown (Table)
  const platforms = data.platform_insights ?? [];
  const platformRates = data.meta?.platform_rates ?? {};

  if (platforms.length > 0) {
    if (yPos > PAGE_HEIGHT - 60) {
      doc.addPage();
      addPageBackground(doc);
      yPos = MARGIN;
    }

    drawText(doc, 'PLATFORM BREAKDOWN', MARGIN, yPos, { size: 10, style: 'bold', color: COLORS.textMuted });
    yPos += 5;

    const tableData = platforms.map(p => [
      p.label,
      `${(platformRates[p.platform] ?? 0).toFixed(1)}%`,
      p.status.toUpperCase(),
      p.insight
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Platform', 'Mention Rate', 'Status', 'Insight']],
      body: tableData,
      theme: 'grid',
      styles: {
        fillColor: COLORS.bg,
        textColor: COLORS.text,
        lineColor: COLORS.cardBorder,
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: COLORS.card,
        textColor: COLORS.textMuted,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: COLORS.bg,
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        3: { cellWidth: 80 } // Insight column wider
      },
      margin: { left: MARGIN, right: MARGIN },
    });

    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 15;
  }

  // 6. Benchmarks
  const benchmarks = data.benchmarks ?? [];
  if (benchmarks.length > 0) {
    if (yPos > PAGE_HEIGHT - 60) {
      doc.addPage();
      addPageBackground(doc);
      yPos = MARGIN;
    }

    drawText(doc, 'INDUSTRY BENCHMARKS', MARGIN, yPos, { size: 10, style: 'bold', color: COLORS.textMuted });
    yPos += 10;

    benchmarks.forEach((b, i) => {
      // Avoid page break inside a benchmark card
      if (yPos > PAGE_HEIGHT - 30) {
        doc.addPage();
        addPageBackground(doc);
        yPos = MARGIN;
      }

      const color = COLORS.chart[i % COLORS.chart.length];
      
      // Card container
      drawCard(doc, MARGIN, yPos, CONTENT_WIDTH, 25);
      
      // Label & Score
      drawText(doc, b.label, MARGIN + 5, yPos + 8, { size: 10, style: 'bold' });
      drawText(doc, `${b.yours}%`, PAGE_WIDTH - MARGIN - 5, yPos + 8, { size: 12, style: 'bold', align: 'right', color: color });

      // Bar
      const barY = yPos + 15;
      const barW = CONTENT_WIDTH - 10;
      
      // Your Score Bar
      doc.setFillColor(color);
      doc.roundedRect(MARGIN + 5, barY, (barW * Math.min(b.yours, 100)) / 100, 3, 1.5, 1.5, 'F');
      
      // Industry Avg Marker (simple vertical line or different color bar behind? let's keep it simple)
      
      yPos += 30;
    });
  }

  // 7. Competitive Landscape (Table)
  const competitors = data.meta?.competitors ?? [];
  if (competitors.length > 0) {
    if (yPos > PAGE_HEIGHT - 60) {
      doc.addPage();
      addPageBackground(doc);
      yPos = MARGIN;
    }

    drawText(doc, 'COMPETITIVE LANDSCAPE', MARGIN, yPos, { size: 10, style: 'bold', color: COLORS.textMuted });
    yPos += 5;

    const compData = competitors.sort((a,b) => b.score - a.score).map((c, i) => [
      `#${i + 1}`,
      c.domain + (c.is_you ? ' (You)' : ''),
      `${c.score.toFixed(0)}/100`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Rank', 'Competitor', 'GEO Score']],
      body: compData,
      theme: 'grid',
      styles: {
        fillColor: COLORS.bg,
        textColor: COLORS.text,
        lineColor: COLORS.cardBorder,
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: COLORS.card,
        textColor: COLORS.textMuted,
        fontStyle: 'bold',
      },
    });

    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 15;
  }

  // 8. Risks & Threats
  const risks = data.risks ?? [];
  if (risks.length > 0) {
    if (yPos > PAGE_HEIGHT - 60) {
      doc.addPage();
      addPageBackground(doc);
      yPos = MARGIN;
    }

    drawText(doc, 'RISKS & THREATS', MARGIN, yPos, { size: 10, style: 'bold', color: COLORS.textMuted });
    yPos += 10;

    risks.forEach(risk => {
      if (yPos > PAGE_HEIGHT - 40) {
        doc.addPage();
        addPageBackground(doc);
        yPos = MARGIN;
      }

      drawCard(doc, MARGIN, yPos, CONTENT_WIDTH, 30);
      const priorityColor = risk.priority === 'CRITICAL' || risk.priority === 'HIGH' ? COLORS.danger : COLORS.warning;
      drawText(doc, risk.priority, MARGIN + 5, yPos + 8, { size: 7, style: 'bold', color: priorityColor });
      drawText(doc, risk.title, MARGIN + 5, yPos + 15, { size: 10, style: 'bold' });
      
      const splitDesc = doc.splitTextToSize(risk.description, CONTENT_WIDTH - 10);
      doc.setFontSize(9);
      doc.setTextColor(COLORS.textMuted);
      doc.text(splitDesc, MARGIN + 5, yPos + 22);
      
      yPos += 35;
    });
  }

  // 9. Recommendations
  const recs = data.recommendations ?? [];
  if (recs.length > 0) {
    if (yPos > PAGE_HEIGHT - 60) {
      doc.addPage();
      addPageBackground(doc);
      yPos = MARGIN;
    }

    drawText(doc, 'ACTIONABLE RECOMMENDATIONS', MARGIN, yPos, { size: 10, style: 'bold', color: COLORS.textMuted });
    yPos += 10;

    recs.forEach(rec => {
      if (yPos > PAGE_HEIGHT - 50) {
        doc.addPage();
        addPageBackground(doc);
        yPos = MARGIN;
      }

      drawCard(doc, MARGIN, yPos, CONTENT_WIDTH, 40);
      const priorityColor = rec.priority === 'HIGH' ? COLORS.success : (rec.priority === 'MEDIUM' ? COLORS.warning : COLORS.textMuted);
      drawText(doc, `PRIORITY: ${rec.priority}`, MARGIN + 5, yPos + 8, { size: 7, style: 'bold', color: priorityColor });
      drawText(doc, rec.title, MARGIN + 5, yPos + 15, { size: 10, style: 'bold' });
      
      const splitDesc = doc.splitTextToSize(rec.description, CONTENT_WIDTH - 10);
      doc.setFontSize(9);
      doc.setTextColor(COLORS.text);
      doc.text(splitDesc, MARGIN + 5, yPos + 22);

      drawText(doc, `IMPACT: ${rec.impact}`, MARGIN + 5, yPos + 35, { size: 8, style: 'bold', color: COLORS.success });
      
      yPos += 45;
    });
  }

  // 10. Market Trends
  const trends = data.market_trends ?? [];
  if (trends.length > 0) {
    if (yPos > PAGE_HEIGHT - 60) {
      doc.addPage();
      addPageBackground(doc);
      yPos = MARGIN;
    }

    drawText(doc, 'MARKET TRENDS', MARGIN, yPos, { size: 10, style: 'bold', color: COLORS.textMuted });
    yPos += 10;

    trends.forEach(trend => {
      if (yPos > PAGE_HEIGHT - 50) {
        doc.addPage();
        addPageBackground(doc);
        yPos = MARGIN;
      }

      drawText(doc, trend.title, MARGIN, yPos, { size: 11, style: 'bold' });
      yPos += 6;
      const splitDesc = doc.splitTextToSize(trend.description, CONTENT_WIDTH);
      doc.setFontSize(10);
      doc.setTextColor(COLORS.text);
      doc.text(splitDesc, MARGIN, yPos);
      yPos += splitDesc.length * 5 + 5;

      trend.bullets.forEach(bullet => {
        doc.text(`• ${bullet}`, MARGIN + 5, yPos);
        yPos += 5;
      });
      yPos += 10;
    });
  }

  // 11. Competitor Intelligence
  const intel = data.competitor_intel ?? [];
  if (intel.length > 0) {
    if (yPos > PAGE_HEIGHT - 60) {
      doc.addPage();
      addPageBackground(doc);
      yPos = MARGIN;
    }

    drawText(doc, 'COMPETITOR INTELLIGENCE', MARGIN, yPos, { size: 10, style: 'bold', color: COLORS.textMuted });
    yPos += 10;

    intel.forEach(c => {
      if (yPos > PAGE_HEIGHT - 60) {
        doc.addPage();
        addPageBackground(doc);
        yPos = MARGIN;
      }

      drawCard(doc, MARGIN, yPos, CONTENT_WIDTH, 50);
      drawText(doc, c.name, MARGIN + 5, yPos + 10, { size: 12, style: 'bold' });
      drawText(doc, c.domain, MARGIN + 60, yPos + 10, { size: 9, color: COLORS.textMuted });

      doc.setFontSize(9);
      doc.setTextColor(COLORS.textMuted);
      doc.text('AI Presence:', MARGIN + 5, yPos + 20);
      doc.setTextColor(COLORS.text);
      const splitPres = doc.splitTextToSize(c.ai_presence, CONTENT_WIDTH - 40);
      doc.text(splitPres, MARGIN + 35, yPos + 20);
      
      yPos += 10 + (splitPres.length * 4);
      
      doc.setTextColor(COLORS.textMuted);
      doc.text('Trust Signals:', MARGIN + 5, yPos + 10);
      doc.setTextColor(COLORS.text);
      const splitTrust = doc.splitTextToSize(c.trust_signals, CONTENT_WIDTH - 40);
      doc.text(splitTrust, MARGIN + 35, yPos + 10);

      yPos += 25;
    });
  }

  // 12. Site Overview
  const site = data.site_overview;
  if (site) {
    if (yPos > PAGE_HEIGHT - 60) {
      doc.addPage();
      addPageBackground(doc);
      yPos = MARGIN;
    }

    drawText(doc, 'SITE OVERVIEW & ACCESSIBILITY', MARGIN, yPos, { size: 10, style: 'bold', color: COLORS.textMuted });
    yPos += 10;

    const statusColor = site.access_status === 'ok' ? COLORS.success : (site.access_status === 'blocked' ? COLORS.danger : COLORS.warning);
    drawText(doc, `STATUS: ${site.access_status.toUpperCase()}`, MARGIN, yPos, { size: 10, style: 'bold', color: statusColor });
    yPos += 8;

    const splitSummary = doc.splitTextToSize(site.summary, CONTENT_WIDTH);
    drawText(doc, site.summary, MARGIN, yPos);
    yPos += splitSummary.length * 5 + 10;

    if (site.pages.length > 0) {
      drawText(doc, 'Top Indexed Pages:', MARGIN, yPos, { size: 9, style: 'bold' });
      yPos += 5;
      
      const pageData = site.pages.slice(0, 5).map(p => [p.path, p.title, p.ai_mentions.toString()]);
      autoTable(doc, {
        startY: yPos,
        head: [['Path', 'Title', 'Mentions']],
        body: pageData,
        theme: 'grid',
        styles: { fillColor: COLORS.bg, textColor: COLORS.text, lineColor: COLORS.cardBorder, lineWidth: 0.1 },
        headStyles: { fillColor: COLORS.card, textColor: COLORS.textMuted },
      });
      // @ts-ignore
      yPos = doc.lastAutoTable.finalY + 15;
    }
  }

  // 13. Citations
  const citations = data.citations ?? [];
  if (citations.length > 0) {
    if (yPos > PAGE_HEIGHT - 60) {
      doc.addPage();
      addPageBackground(doc);
      yPos = MARGIN;
    }

    drawText(doc, 'CITATIONS & SOURCES', MARGIN, yPos, { size: 10, style: 'bold', color: COLORS.textMuted });
    yPos += 10;

    citations.forEach(cit => {
      if (yPos > PAGE_HEIGHT - 35) {
        doc.addPage();
        addPageBackground(doc);
        yPos = MARGIN;
      }

      drawText(doc, cit.title, MARGIN, yPos, { size: 10, style: 'bold' });
      yPos += 5;
      drawText(doc, cit.url, MARGIN, yPos, { size: 8, color: COLORS.success });
      yPos += 5;
      const splitSnippet = doc.splitTextToSize(cit.snippet, CONTENT_WIDTH);
      doc.setFontSize(9);
      doc.setTextColor(COLORS.textMuted);
      doc.text(splitSnippet, MARGIN, yPos);
      yPos += splitSnippet.length * 4 + 10;
    });
  }

  // Footer: Page Numbers
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawText(doc, `Page ${i} of ${pageCount}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 10, { size: 8, align: 'center', color: COLORS.textMuted });
  }

  doc.save(filename);
}
