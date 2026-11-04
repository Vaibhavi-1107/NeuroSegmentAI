import {
  Upload, Cpu, Sliders, Brain, RefreshCw, Share2, Server, Zap
} from 'lucide-react';
import { PipelineStep } from '../components/ui/PipelineStep';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const pipelineSteps = [
  {
    icon: <Upload size={12} />,
    title: 'MRI Upload',
    description: 'PNG/JPEG slice loaded into browser canvas',
    badge: undefined,
    highlight: false,
  },
  {
    icon: <Sliders size={12} />,
    title: 'Preprocessing',
    description: 'Normalisation, windowing, slice extraction',
    badge: undefined,
    highlight: false,
  },
  {
    icon: <Zap size={12} />,
    title: 'Prompt Generation',
    description: 'Text, point clicks, or bounding boxes encoded',
    badge: undefined,
    highlight: false,
  },
  {
    icon: <Server size={12} />,
    title: 'Meta SAM 3.1 API',
    description: 'Hosted model receives image + prompt payload',
    badge: 'Hosted API',
    highlight: true,
  },
  {
    icon: <Cpu size={12} />,
    title: 'Mask Decoding',
    description: 'Probability maps decoded to binary mask',
    badge: undefined,
    highlight: false,
  },
  {
    icon: <RefreshCw size={12} />,
    title: 'Human Refinement',
    description: 'Radiologist reviews and edits segmentation',
    badge: undefined,
    highlight: false,
  },
  {
    icon: <Share2 size={12} />,
    title: 'Export',
    description: 'PNG mask, NIfTI volume, or JSON annotation',
    badge: undefined,
    highlight: false,
    isLast: true,
  },
];

const samKeyFacts = [
  {
    label: 'Architecture',
    value: 'Vision Transformer (ViT-H) + Prompt Encoder + Mask Decoder',
  },
  {
    label: 'Access Method',
    value: 'Hosted Meta API (no local checkpoint required)',
  },
  {
    label: 'Prompt Types',
    value: 'Text (natural language), Points (positive/negative), Bounding Box',
  },
  {
    label: 'Output',
    value: 'Probabilistic mask with confidence score',
  },
  {
    label: 'Zero-shot',
    value: 'Generalises to new domains without fine-tuning',
  },
];

export function Methodology() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col gap-12">
      {/* Header */}
      <section className="max-w-2xl">
        <p className="label-caps mb-3">Methodology</p>
        <h1
          className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4"
          style={{ letterSpacing: '-0.03em' }}
        >
          Planned Segmentation Pipeline
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
          NeuroSegment AI connects a browser-based annotation interface to Meta's hosted
          SAM 3.1 API. The pipeline is designed to be modular — each stage can be
          independently upgraded or replaced without restructuring the frontend.
        </p>
      </section>

      {/* Pipeline diagram */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <p className="label-caps">Pipeline Architecture</p>
          <Badge variant="pending" dot>SAM 3.1 Integration Pending</Badge>
        </div>

        <div
          className="p-4 md:p-6 rounded-xl overflow-x-auto"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 flex-wrap">
            {pipelineSteps.map((step, i) => (
              <PipelineStep
                key={i}
                step={i + 1}
                title={step.title}
                description={step.description}
                icon={step.icon}
                isLast={step.isLast}
                highlight={step.highlight}
                badge={step.badge}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SAM 3.1 explanation */}
      <section>
        <p className="label-caps mb-4">Meta SAM 3.1 — Model Details</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5" accent>
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--color-accent-dim)', border: '1px solid var(--color-accent-border)' }}
              >
                <Brain size={15} style={{ color: 'var(--color-accent)' }} />
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                  Segment Anything Model 3.1
                </h3>
                <span className="label-caps">Meta AI Research</span>
              </div>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
              SAM 3.1 is a foundation model for image segmentation trained on a diverse
              dataset of over 1 billion masks. It supports zero-shot generalisation,
              meaning it can segment novel domains — including medical imaging — without
              domain-specific fine-tuning.
            </p>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--color-text)' }}>
              API vs. Local Checkpoint
            </h3>
            <div className="space-y-3">
              <div
                className="p-3 rounded-lg text-xs"
                style={{
                  background: 'var(--color-accent-dim)',
                  border: '1px solid var(--color-accent-border)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.7,
                }}
              >
                <strong style={{ color: 'var(--color-accent)' }}>✓ Hosted API (NeuroSegment approach)</strong>
                <br />
                No GPU infrastructure required. Meta hosts the model; NeuroSegment sends
                image + prompt payloads and receives mask responses. Simpler deployment,
                always up-to-date model version.
              </div>
              <div
                className="p-3 rounded-lg text-xs"
                style={{
                  background: 'var(--color-surface-high)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-dim)',
                  lineHeight: 1.7,
                }}
              >
                <strong style={{ color: 'var(--color-text-muted)' }}>– Local Checkpoint (not used)</strong>
                <br />
                Requires downloading multi-GB weights, GPU setup, and custom inference code.
                Higher infrastructure overhead for the same output.
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Key facts table */}
      <section>
        <p className="label-caps mb-4">SAM 3.1 Key Properties</p>
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--color-border)' }}
        >
          {samKeyFacts.map(({ label, value }, i) => (
            <div
              key={label}
              className="flex gap-4 px-5 py-3"
              style={{
                background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-high)',
                borderBottom: i < samKeyFacts.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
              }}
            >
              <span
                className="font-mono text-xs font-semibold flex-shrink-0"
                style={{ color: 'var(--color-text-muted)', minWidth: '130px' }}
              >
                {label}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text)', lineHeight: 1.6 }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Prompt encoding diagram */}
      <section>
        <p className="label-caps mb-4">Prompt Encoding Strategy</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              type: 'Text Prompt',
              example: '"brain tumor", "enhancing region"',
              note: 'Encoded via CLIP-style text encoder',
              color: 'var(--color-accent)',
              bg: 'var(--color-accent-dim)',
              border: 'var(--color-accent-border)',
            },
            {
              type: 'Point Prompts',
              example: 'Click + / − on canvas',
              note: 'Positional embeddings for include/exclude',
              color: 'var(--color-success)',
              bg: 'rgba(52,211,153,0.1)',
              border: 'rgba(52,211,153,0.3)',
            },
            {
              type: 'Bounding Box',
              example: 'Draw ROI rectangle',
              note: 'Top-left & bottom-right corner coordinates',
              color: 'var(--color-warning)',
              bg: 'rgba(251,191,36,0.1)',
              border: 'rgba(251,191,36,0.3)',
            },
          ].map(({ type, example, note, color, bg, border }) => (
            <div
              key={type}
              className="p-4 rounded-xl"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <p className="text-xs font-bold mb-1.5" style={{ color }}>
                {type}
              </p>
              <p className="text-xs font-mono mb-2" style={{ color: 'var(--color-text)', fontStyle: 'italic' }}>
                "{example}"
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                {note}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
