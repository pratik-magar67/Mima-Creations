import React from "react";
import { Link } from "react-router-dom";
import {
ArrowRight,
Heart,
Scissors,
Sparkles,
} from "lucide-react";

import {
CREAM,
CREAM_DARK,
INK,
INK_SOFT,
SAGE,
SAGE_DARK,
SAGE_LIGHT,
ROSE,
Logo,
Reveal,
StitchDivider,
} from "../components/SiteComponents";

export default function About() {
return (
<div
style={{
background: CREAM,
color: INK,
}}
>
<section
className="px-6 md:px-12 pt-16 md:pt-24 pb-14"
style={{
background: CREAM,
}}
>
<div className="max-w-5xl mx-auto">
<Reveal>
<p
className="eyebrow mb-4"
style={{
color: SAGE_DARK,
}}
>
Our story
</p>

        <h1
          className="display text-4xl md:text-6xl leading-tight max-w-3xl"
          style={{
            color: INK,
          }}
        >
          Made slowly.
          <br />
          Made with care.
        </h1>

        <p
          className="mt-6 text-base md:text-lg leading-8 max-w-2xl"
          style={{
            color: INK_SOFT,
          }}
        >
          Mima Creations is a small, handmade
          clothing studio where every piece is
          created with patience, attention to
          detail, and a love for things made by
          hand.
        </p>
      </Reveal>
    </div>
  </section>

  <div className="max-w-6xl mx-auto px-6 md:px-12">
    <StitchDivider />
  </div>

  <section className="px-6 md:px-12 py-16 md:py-24">
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
      <Reveal>
        <div
          className="aspect-[4/5] flex items-center justify-center"
          style={{
            background: SAGE_LIGHT,
            border:
              "1px solid " + SAGE,
          }}
        >
          <div className="text-center px-8">
            <Logo size={150} />

            <p
              className="script text-3xl mt-4"
              style={{
                color: INK,
              }}
            >
              Made for you
            </p>

            <p
              className="text-sm mt-3"
              style={{
                color: INK_SOFT,
              }}
            >
              Handmade with intention
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div>
          <p
            className="eyebrow mb-4"
            style={{
              color: ROSE,
            }}
          >
            About Mima
          </p>

          <h2
            className="display text-3xl md:text-4xl leading-tight mb-6"
            style={{
              color: INK,
            }}
          >
            Clothing that feels
            <br />
            personal.
          </h2>

          <div
            className="space-y-5 text-sm md:text-base leading-7"
            style={{
              color: INK_SOFT,
            }}
          >
            <p>
              At Mima Creations, we believe
              clothing should feel like it
              belongs to the person wearing it.
              That means thoughtful details,
              comfortable fits, and designs
              that reflect your personality.
            </p>

            <p>
              From embroidered blouses and
              sarees to dresses, kurtis and
              crochet pieces, each creation is
              made with care rather than mass
              produced.
            </p>

            <p>
              We work with you from the first
              idea to the finished piece,
              creating something that feels
              genuinely yours.
            </p>
          </div>

          <Link
            to="/enquiry"
            className="btn inline-flex items-center gap-2 mt-8 px-6 py-3 text-sm"
            style={{
              background: SAGE_DARK,
              color: CREAM,
            }}
          >
            Start your piece
            <ArrowRight size={16} />
          </Link>
        </div>
      </Reveal>
    </div>
  </section>

  <section
    className="px-6 md:px-12 py-16 md:py-20"
    style={{
      background: CREAM_DARK,
    }}
  >
    <div className="max-w-6xl mx-auto">
      <Reveal>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p
            className="eyebrow mb-4"
            style={{
              color: SAGE_DARK,
            }}
          >
            What matters to us
          </p>

          <h2
            className="display text-3xl md:text-4xl"
            style={{
              color: INK,
            }}
          >
            The little things matter.
          </h2>
        </div>
      </Reveal>

      <div className="grid md:grid-cols-3 gap-6">
        <Reveal delay={0.05}>
          <AboutValue
            icon={
              <Heart
                size={26}
                strokeWidth={1.3}
              />
            }
            title="Made with care"
            text="Every piece receives individual attention, from the first measurement to the final stitch."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <AboutValue
            icon={
              <Scissors
                size={26}
                strokeWidth={1.3}
              />
            }
            title="Made to fit"
            text="We create pieces around you, rather than asking you to fit into a standard shape."
          />
        </Reveal>

        <Reveal delay={0.15}>
          <AboutValue
            icon={
              <Sparkles
                size={26}
                strokeWidth={1.3}
              />
            }
            title="Made uniquely"
            text="Your ideas, preferences and little details are what make each Mima creation special."
          />
        </Reveal>
      </div>
    </div>
  </section>

  <section className="px-6 md:px-12 py-16 md:py-24">
    <div className="max-w-4xl mx-auto text-center">
      <Reveal>
        <p
          className="script text-3xl md:text-4xl mb-5"
          style={{
            color: ROSE,
          }}
        >
          Something made just for you
        </p>

        <h2
          className="display text-3xl md:text-5xl leading-tight"
          style={{
            color: INK,
          }}
        >
          Have an idea in mind?
        </h2>

        <p
          className="max-w-xl mx-auto mt-5 text-sm md:text-base leading-7"
          style={{
            color: INK_SOFT,
          }}
        >
          Tell us what you are imagining.
          Whether you have a complete design
          in mind or just a feeling you want to
          capture, we can start from there.
        </p>

        <Link
          to="/enquiry"
          className="btn inline-flex items-center gap-2 mt-8 px-7 py-3"
          style={{
            background: ROSE,
            color: CREAM,
          }}
        >
          Make an enquiry
          <ArrowRight size={17} />
        </Link>
      </Reveal>
    </div>
  </section>
</div>

);
}

function AboutValue({
icon,
title,
text,
}) {
return (
<div
className="h-full p-7 md:p-8"
style={{
background: CREAM,
border:
"1px solid " + SAGE,
}}
>
<div
className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
style={{
background: SAGE_LIGHT,
color: SAGE_DARK,
}}
>
{icon}
</div>

  <h3
    className="display text-xl mb-3"
    style={{
      color: INK,
    }}
  >
    {title}
  </h3>

  <p
    className="text-sm leading-6"
    style={{
      color: INK_SOFT,
    }}
  >
    {text}
  </p>
</div>

);
}

//no change for today