import { Brain, Code2, Rocket, Trophy } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const techTable = [
  { category: 'Model API', item: 'Meta SAM 3.1', purpose: 'Prompt-guided segmentation backbone' },
  { category: 'Frontend', item: 'React 19 + Vite 8', purpose: 'Fast, modular UI framework' },
  { category: 'Language', item: 'TypeScript', purpose: 'Type safety across all modules' },
  { category: 'Styling', item: 'Tailwind CSS v4', purpose: 'Utility-first responsive design' },
  { category: 'Icons', item: 'Lucide React', purpose: 'Consistent icon library' },
  { category: 'Charts', item: 'Recharts', purpose: 'Research data visualisation' },
  { category: 'Backend', item: 'FastAPI + Python', purpose: 'SAM proxy, validation & mask post-processing' },
  { category: 'Routing', item: 'React Router v7', purpose: 'Client-side navigation' },
];

const futureScope = [
  {
    phase: 'Next',
    title: 'Validated Segmentation Workflow',
    description:
      'Validate prompt quality on real MRI data, then add DICOM parsing, volumetric navigation, and annotation propagation.',
  },
  {
    phase: 'Phase 3',
    title: 'DICOM Support & Multi-Slice',
    description:
      'Full DICOM parsing, volumetric MRI navigation, and 3D annotation propagation across axial slices.',
  },
  {
    phase: 'Phase 4',
    title: 'Collaborative Annotation',
    description:
      'Multi-user annotation with version control, conflict resolution, and inter-rater agreement tracking.',
  },
  {
    phase: 'Phase 5',
    title: 'Domain Fine-Tuning',
    description:
      'Optional LoRA fine-tuning on curated brain MRI data to improve segmentation precision for specific tumour sub-types.',
  },
];

export function About() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col gap-12">
      {/* Header */}
      <section className="max-w-2xl">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <p className="label-caps">About</p>
          <Badge variant="accent">Meta Global AI Hackathon 2026</Badge>
        </div>
        <h1
          className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4"
          style={{ letterSpacing: '-0.03em' }}
        >
          About NeuroSegment AI
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
          NeuroSegment AI is a research prototype developed for the Meta Global AI Hackathon 2026.
          It explores how Meta's Segment Anything Model 3.1 can accelerate brain tumour annotation
          in medical imaging research.
        </p>
      </section>

      {/* Motivation */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--color-accent-dim)', border: '1px solid var(--color-accent-border)' }}
          >
            <Brain size={15} style={{ color: 'var(--color-accent)' }} />
          </div>
          <p className="label-caps">Project Motivation</p>
        </div>
        <Card className="p-5">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)', lineHeight: 1.85 }}>
            Brain tumour segmentation is a critical step in treatment planning, clinical trials,
            and AI model development. Manual delineation by neuro-radiologists remains the gold
            standard but is extremely time-consuming — typically 30–90 minutes per case. This
            bottleneck slows large-scale studies and limits dataset creation for deep-learning research.
          </p>
          <p className="text-sm mt-4" style={{ color: 'var(--color-text-muted)', lineHeight: 1.85 }}>
            NeuroSegment AI explores whether a foundation model — Meta SAM 3.1 — can serve as
            an intelligent annotation assistant, dramatically reducing the time clinicians spend
            on initial mask creation while preserving their expert judgment in the review loop.
          </p>
        </Card>
      </section>

      {/* Research objectives */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--color-accent-dim)', border: '1px solid var(--color-accent-border)' }}
          >
            <Rocket size={15} style={{ color: 'var(--color-accent)' }} />
          </div>
          <p className="label-caps">Research Objectives</p>
        </div>
        <div className="space-y-2">
          {[
            'Evaluate SAM 3.1 zero-shot performance on brain MRI segmentation against BraTS benchmarks.',
            'Quantify annotation time reduction achieved with AI-assisted vs. fully manual workflows.',
            'Design a prompt interface optimised for radiologists with no deep-learning background.',
            'Build a modular, open architecture suitable for downstream fine-tuning and extension.',
            'Document failure modes and edge cases for transparent evaluation reporting.',
          ].map((obj, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg text-sm"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
                lineHeight: 1.7,
              }}
            >
              <span
                className="font-mono text-xs font-bold flex-shrink-0 mt-0.5"
                style={{ color: 'var(--color-accent)' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              {obj}
            </div>
          ))}
        </div>
      </section>

      {/* Technical approach */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--color-accent-dim)', border: '1px solid var(--color-accent-border)' }}
          >
            <Code2 size={15} style={{ color: 'var(--color-accent)' }} />
          </div>
          <p className="label-caps">Technical Approach</p>
        </div>
        <Card className="p-5">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)', lineHeight: 1.85 }}>
            The architecture is deliberately split into two decoupled layers. The <strong style={{ color: 'var(--color-text)' }}>React frontend</strong> handles
            all user interaction — image loading, prompt entry, mask visualisation, and export. It
            communicates with a <strong style={{ color: 'var(--color-text)' }}>FastAPI backend proxy</strong>, which forwards requests to
            the Meta SAM 3.1 hosted API, validates uploads, and post-processes returned masks.
          </p>
          <p className="text-sm mt-4" style={{ color: 'var(--color-text-muted)', lineHeight: 1.85 }}>
            All API-related frontend code is isolated in <code style={{ color: 'var(--color-accent)', background: 'var(--color-surface-high)', padding: '1px 4px', borderRadius: '3px' }}>src/services/samApi.ts</code>.
            Empty model responses are surfaced as errors rather than replaced with demo output.
          </p>
        </Card>
      </section>

      {/* Tech stack table */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--color-accent-dim)', border: '1px solid var(--color-accent-border)' }}
          >
            <Code2 size={15} style={{ color: 'var(--color-accent)' }} />
          </div>
          <p className="label-caps">Technologies Used</p>
        </div>
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--color-border)' }}
        >
          {techTable.map(({ category, item, purpose }, i) => (
            <div
              key={item}
              className="grid px-4 py-3 gap-4"
              style={{
                gridTemplateColumns: '120px 160px 1fr',
                background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-high)',
                borderBottom: i < techTable.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
              }}
            >
              <span className="label-caps self-center">{category}</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                {item}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {purpose}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Future scope */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--color-accent-dim)', border: '1px solid var(--color-accent-border)' }}
          >
            <Rocket size={15} style={{ color: 'var(--color-accent)' }} />
          </div>
          <p className="label-caps">Future Scope</p>
        </div>
        <div className="space-y-3">
          {futureScope.map(({ phase, title, description }) => (
            <div
              key={phase}
              className="flex gap-4 p-4 rounded-xl"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex-shrink-0">
                <Badge variant="accent">{phase}</Badge>
              </div>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                  {title}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hackathon badge */}
      <section>
        <Card className="p-6" accent>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'var(--color-accent-dim)',
                border: '1px solid var(--color-accent-border)',
              }}
            >
              <Trophy size={24} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1 flex-wrap">
                <h3 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
                  Meta Global AI Hackathon 2026
                </h3>
                <Badge variant="accent">Active</Badge>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                NeuroSegment AI is submitted as a research prototype to the Meta Global AI Hackathon 2026,
                demonstrating practical application of Meta's foundation models in healthcare AI.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
