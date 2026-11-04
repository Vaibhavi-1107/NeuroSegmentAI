import { Link } from 'react-router-dom';
import { ArrowRight, Upload, Cpu, FileOutput, Brain, Clock, Users, Target } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

const techStack = [
  { name: 'Meta SAM 3.1', category: 'Model' },
  { name: 'React + Vite', category: 'Frontend' },
  { name: 'TypeScript', category: 'Language' },
  { name: 'FastAPI', category: 'Backend (Planned)' },
  { name: 'Tailwind CSS', category: 'Styling' },
  { name: 'Python', category: 'Backend' },
];

const workflowSteps = [
  {
    number: '01',
    icon: Upload,
    title: 'Upload MRI',
    description:
      'Load a PNG or JPEG brain MRI slice in the current 2D annotation workflow.',
  },
  {
    number: '02',
    icon: Cpu,
    title: 'Prompt-Guided Segmentation',
    description:
      'Use text descriptions, point clicks, or bounding boxes to guide Meta SAM 3.1.',
  },
  {
    number: '03',
    icon: FileOutput,
    title: 'Refine & Export',
    description:
      'Manually refine the generated mask, then export as PNG, NIfTI, or JSON.',
  },
];

const objectives = [
  {
    icon: Clock,
    title: 'Reduce Annotation Time',
    description: 'Target 60–80% reduction in manual annotation time per MRI study.',
  },
  {
    icon: Target,
    title: 'Improve Precision',
    description: 'Achieve Dice coefficients above 0.85 on standard brain tumor benchmarks.',
  },
  {
    icon: Users,
    title: 'Clinician-Friendly UX',
    description: 'Design for radiologists with zero deep-learning expertise required.',
  },
  {
    icon: Brain,
    title: 'Prompt Flexibility',
    description: 'Support text, point, and bounding-box prompts in a unified interface.',
  },
];

export function Overview() {
  return (
    <div
      className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col gap-12"
    >
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
            <Badge variant="accent" dot>Meta SAM 3.1 · Prompt-Guided Segmentation</Badge>
            <Badge variant="accent">Hackathon 2026</Badge>
          </div>

          <h1
            className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight"
            style={{ letterSpacing: '-0.03em' }}
          >
            NeuroSegment
            <span style={{ color: 'var(--color-accent)' }}> AI</span>
          </h1>

          <p
            className="text-base md:text-lg mb-2 font-medium"
            style={{ color: 'var(--color-text-muted)', maxWidth: '480px' }}
          >
            Faster Brain Tumor Annotation Through Prompt-Guided Segmentation
          </p>

          <p
            className="text-sm mb-8"
            style={{ color: 'var(--color-text-dim)', maxWidth: '460px', lineHeight: 1.75 }}
          >
            An interactive platform for medical researchers to annotate brain MRI images
            using Meta's SAM 3.1 segmentation model — guided by natural language, clicks,
            or bounding boxes.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <Link to="/workspace">
              <button
                id="cta-open-workspace"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-150"
                style={{
                  background: 'var(--color-accent)',
                  color: '#0d0f14',
                }}
              >
                Open Annotation Workspace
                <ArrowRight size={15} />
              </button>
            </Link>
            <Link to="/methodology">
              <button
                id="cta-explore-methodology"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150"
                style={{
                  background: 'var(--color-surface-high)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              >
                Explore Methodology
              </button>
            </Link>
          </div>
        </div>

        {/* MRI illustration */}
        <div className="flex-shrink-0 w-full md:w-72">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: '#080a0d',
              border: '1px solid var(--color-border)',
              aspectRatio: '1 / 1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* SVG brain MRI illustration */}
            <svg viewBox="0 0 280 280" width="240" height="240" xmlns="http://www.w3.org/2000/svg">
              {/* Brain outline */}
              <ellipse cx="140" cy="130" rx="95" ry="85" fill="none" stroke="#1d2029" strokeWidth="1.5"/>
              <ellipse cx="140" cy="130" rx="78" ry="70" fill="#111318"/>
              {/* Cortex folds - left hemisphere */}
              <path d="M80 100 Q70 85 85 75 Q100 65 110 80 Q95 88 80 100Z" fill="#1a1d24" stroke="#252836" strokeWidth="0.8"/>
              <path d="M68 130 Q58 115 72 108 Q88 102 92 118 Q78 122 68 130Z" fill="#1a1d24" stroke="#252836" strokeWidth="0.8"/>
              <path d="M72 158 Q62 145 75 138 Q90 132 96 148 Q82 152 72 158Z" fill="#1a1d24" stroke="#252836" strokeWidth="0.8"/>
              <path d="M90 182 Q82 168 97 162 Q113 157 115 173 Q102 176 90 182Z" fill="#1a1d24" stroke="#252836" strokeWidth="0.8"/>
              {/* Cortex folds - right hemisphere */}
              <path d="M200 100 Q210 85 195 75 Q180 65 170 80 Q185 88 200 100Z" fill="#1a1d24" stroke="#252836" strokeWidth="0.8"/>
              <path d="M212 130 Q222 115 208 108 Q192 102 188 118 Q202 122 212 130Z" fill="#1a1d24" stroke="#252836" strokeWidth="0.8"/>
              <path d="M208 158 Q218 145 205 138 Q190 132 184 148 Q198 152 208 158Z" fill="#1a1d24" stroke="#252836" strokeWidth="0.8"/>
              <path d="M190 182 Q198 168 183 162 Q167 157 165 173 Q178 176 190 182Z" fill="#1a1d24" stroke="#252836" strokeWidth="0.8"/>
              {/* Mid-line */}
              <line x1="140" y1="60" x2="140" y2="200" stroke="#252836" strokeWidth="0.8" strokeDasharray="3,3"/>
              {/* Tumor region — highlighted */}
              <ellipse cx="165" cy="115" rx="22" ry="18" fill="rgba(56,189,248,0.25)" stroke="rgba(56,189,248,0.7)" strokeWidth="1.5"/>
              <ellipse cx="165" cy="115" rx="14" ry="11" fill="rgba(56,189,248,0.4)"/>
              {/* Segmentation dots */}
              <circle cx="148" cy="110" r="2.5" fill="rgba(52,211,153,0.9)"/>
              <circle cx="172" cy="108" r="2.5" fill="rgba(52,211,153,0.9)"/>
              <circle cx="165" cy="125" r="2.5" fill="rgba(248,113,113,0.9)"/>
              {/* Brain stem */}
              <rect x="128" y="195" width="24" height="22" rx="4" fill="#111318" stroke="#252836" strokeWidth="1"/>
              {/* Scale bar */}
              <line x1="60" y1="225" x2="100" y2="225" stroke="#252836" strokeWidth="1"/>
              <text x="72" y="235" fontSize="7" fill="#4a5568" fontFamily="monospace">10 mm</text>
              {/* Legend */}
              <circle cx="185" cy="228" r="4" fill="rgba(56,189,248,0.4)" stroke="rgba(56,189,248,0.7)" strokeWidth="1"/>
              <text x="193" y="232" fontSize="7" fill="#8892a4" fontFamily="monospace">Tumor ROI</text>
            </svg>

            {/* Corner badge */}
            <div
              className="absolute bottom-3 right-3 px-2 py-1 rounded text-xs font-mono"
              style={{
                background: 'rgba(13,15,20,0.85)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              Demo · Axial T1
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem & Solution ───────────────────────────────────────────── */}
      <section>
        <p className="label-caps mb-4">Research Context</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5">
            <div
              className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"
              style={{ color: 'var(--color-danger)' }}
            >
              <span className="w-1 h-8 rounded flex-shrink-0" style={{ background: 'var(--color-danger)' }} />
              Problem
            </div>
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              Manual MRI Annotation is Time-Consuming
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)', lineHeight: 1.75 }}>
              Manual delineation of brain tumor regions from MRI volumes is a highly specialized,
              labour-intensive task. A single case can require <strong style={{ color: 'var(--color-text)' }}>30–90 minutes</strong> of expert radiologist
              time. At scale, this creates severe bottlenecks in clinical trials and AI training
              dataset construction.
            </p>
          </Card>

          <Card className="p-5" accent>
            <div
              className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"
              style={{ color: 'var(--color-accent)' }}
            >
              <span className="w-1 h-8 rounded flex-shrink-0" style={{ background: 'var(--color-accent)' }} />
              Solution
            </div>
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              Prompt-Guided Segmentation with SAM 3.1
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)', lineHeight: 1.75 }}>
              Meta's Segment Anything Model 3.1 enables zero-shot segmentation driven by text,
              point, or bounding-box prompts. NeuroSegment AI wraps this capability in a
              clinician-friendly interface, reducing annotation effort while keeping a human
              expert in the loop for final validation.
            </p>
          </Card>
        </div>
      </section>

      {/* ── Workflow Steps ───────────────────────────────────────────────── */}
      <section>
        <p className="label-caps mb-6">Workflow</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workflowSteps.map(({ number, icon: Icon, title, description }, i) => (
            <Card key={i} className="p-5" hover>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'var(--color-accent-dim)',
                    border: '1px solid var(--color-accent-border)',
                  }}
                >
                  <Icon size={16} style={{ color: 'var(--color-accent)' }} />
                </div>
                <span
                  className="font-mono text-2xl font-bold"
                  style={{ color: 'var(--color-surface-raised)', letterSpacing: '-0.04em' }}
                >
                  {number}
                </span>
              </div>
              <h3 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>
                {title}
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)', lineHeight: 1.75 }}>
                {description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Tech Stack ───────────────────────────────────────────────────── */}
      <section>
        <p className="label-caps mb-4">Technology Stack</p>
        <div className="flex flex-wrap gap-2">
          {techStack.map(({ name, category }) => (
            <div
              key={name}
              className="flex flex-col px-3 py-2 rounded-lg"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                {name}
              </span>
              <span className="label-caps mt-0.5">{category}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Research Objectives ──────────────────────────────────────────── */}
      <section>
        <p className="label-caps mb-4">Research Objectives & Expected Impact</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {objectives.map(({ icon: Icon, title, description }, i) => (
            <div
              key={i}
              className="flex gap-3 p-4 rounded-xl transition-all duration-150 hover:border-[var(--color-accent)]"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--color-surface-high)' }}
              >
                <Icon size={15} style={{ color: 'var(--color-accent)' }} />
              </div>
              <div>
                <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--color-text)' }}>
                  {title}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)', lineHeight: 1.65 }}>
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
