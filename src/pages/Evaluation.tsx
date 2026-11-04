import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

const metricCards = [
  {
    label: 'Dice Coefficient',
    value: 'Awaiting results',
    description: 'Spatial overlap between predicted and ground-truth mask',
    formula: '2|P∩G| / (|P|+|G|)',
  },
  {
    label: 'Intersection over Union',
    value: 'Awaiting results',
    description: 'Ratio of overlap to union of predicted and ground-truth regions',
    formula: '|P∩G| / |P∪G|',
  },
  {
    label: 'Annotation Time',
    value: 'Awaiting results',
    description: 'Average time per case for AI-assisted vs. manual workflow',
    formula: 'minutes / case',
  },
  {
    label: 'Human Agreement',
    value: 'Awaiting results',
    description: 'Inter-rater agreement between AI mask and expert annotation',
    formula: "Cohen's κ",
  },
];

export function Evaluation() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col gap-12">
      {/* Header */}
      <section className="max-w-2xl">
        <div className="flex items-center gap-3 mb-3">
          <p className="label-caps">Research & Evaluation</p>
          <Badge variant="warning">Demo Placeholders</Badge>
        </div>
        <h1
          className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4"
          style={{ letterSpacing: '-0.03em' }}
        >
          Evaluation Dashboard
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
          This dashboard defines the planned evaluation framework for NeuroSegment AI. It remains
          intentionally empty until real MRI studies and SAM 3.1 outputs are available for analysis.
        </p>
        <div
          className="mt-4 p-3 rounded-lg text-xs flex gap-2.5"
          style={{
            background: 'rgba(251,191,36,0.08)',
            border: '1px solid rgba(251,191,36,0.25)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.65,
          }}
        >
          <span style={{ color: 'var(--color-warning)', flexShrink: 0 }}>⚠</span>
          No study results are currently displayed. This page is intentionally empty until
          real annotation outputs and ground-truth comparisons are collected.
        </div>
      </section>

      {/* Metric cards */}
      <section>
        <p className="label-caps mb-4">Evaluation Metrics</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {metricCards.map(({ label, value, description, formula }) => (
            <Card key={label} className="p-4 flex flex-col gap-2">
              <span className="label-caps">{label}</span>
              <div className="flex items-end gap-2">
                <span
                  className="font-mono text-sm font-bold"
                  style={{ color: 'var(--color-text-dim)' }}
                >
                  {value}
                </span>
              </div>
              <div
                className="font-mono text-xs px-2 py-0.5 rounded self-start"
                style={{
                  background: 'var(--color-surface-high)',
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {formula}
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-dim)', lineHeight: 1.6 }}>
                {description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Annotation time chart */}
      <section>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <p className="label-caps">Annotation Time Comparison</p>
          <Badge variant="warning">Data Pending</Badge>
        </div>
        <Card className="p-5">
          <div
            className="flex min-h-[220px] items-center justify-center text-center px-6"
            style={{ border: '1px dashed var(--color-border)', borderRadius: '12px', color: 'var(--color-text-dim)' }}
          >
            <p className="text-sm" style={{ maxWidth: '420px', lineHeight: 1.8 }}>
              Annotation time comparisons and benchmark charts will appear here once real MRI
              studies are run and expert annotations are collected.
            </p>
          </div>
        </Card>
      </section>

      {/* Image comparison placeholder */}
      <section>
        <p className="label-caps mb-4">Visual Comparison — Sample Layout</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Original MRI', desc: 'T1 Contrast-Enhanced', accent: false },
            { label: 'AI Prediction', desc: 'SAM 3.1 Mask (Pending)', accent: true },
            { label: 'Ground Truth', desc: 'Expert Annotation', accent: false },
          ].map(({ label, desc, accent }) => (
            <div key={label} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                  {label}
                </span>
                {accent && <Badge variant="pending">Pending</Badge>}
              </div>
              <div
                className="rounded-xl flex flex-col items-center justify-center"
                style={{
                  background: '#080a0d',
                  border: accent
                    ? '1px solid var(--color-accent-border)'
                    : '1px solid var(--color-border)',
                  height: '180px',
                }}
              >
                {/* Mini brain SVG placeholder */}
                <svg viewBox="0 0 100 100" width="80" height="80" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="50" cy="45" rx="35" ry="30" fill="#111318" stroke="#252836" strokeWidth="1"/>
                  <ellipse cx="50" cy="45" rx="22" ry="18" fill="#0d0f14"/>
                  {accent && (
                    <ellipse cx="58" cy="40" rx="9" ry="7" fill="rgba(56,189,248,0.3)" stroke="rgba(56,189,248,0.7)" strokeWidth="1"/>
                  )}
                  {!accent && label === 'Ground Truth' && (
                    <ellipse cx="58" cy="40" rx="9" ry="7" fill="rgba(52,211,153,0.3)" stroke="rgba(52,211,153,0.7)" strokeWidth="1"/>
                  )}
                </svg>
                <p className="text-xs font-mono mt-2" style={{ color: 'var(--color-text-dim)' }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Evaluation methodology */}
      <section>
        <p className="label-caps mb-4">Evaluation Methodology</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'Dataset',
              body: 'BraTS 2024 benchmark dataset. Multi-site, multi-scanner T1CE, T2, FLAIR MRI volumes. Ground truth provided by expert neuro-radiologists.',
            },
            {
              title: 'Segmentation Targets',
              body: 'Whole tumour (WT), tumour core (TC), and enhancing tumour (ET) sub-regions following BraTS evaluation convention.',
            },
            {
              title: 'Human Study Design',
              body: '5 radiologists annotate 50 cases with and without AI assistance. Annotation time recorded, final masks compared to BraTS ground truth.',
            },
            {
              title: 'Statistical Analysis',
              body: 'Paired Wilcoxon signed-rank test for time comparison. Bland-Altman analysis for mask agreement. Bootstrap 95% CIs reported.',
            },
          ].map(({ title, body }) => (
            <Card key={title} className="p-4">
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                {title}
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)', lineHeight: 1.75 }}>
                {body}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
