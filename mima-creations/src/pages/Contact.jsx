import {
  Mail,
  MessageCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  CREAM,
  INK,
  SAGE_DARK,
  ROSE,
  WHATSAPP_NUMBER,
  Logo,
  InstagramIcon,
  Reveal,
} from "../components/SiteComponents";

export default function Contact() {
  return (
    <section
      className="py-16 md:py-20"
      style={{ background: CREAM }}
    >
      <Reveal className="max-w-6xl mx-auto px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="flex flex-col items-center gap-2">
            <Logo size={90} />

            <span
              className="script text-2xl"
              style={{ color: INK }}
            >
              Mima Creations
            </span>
          </div>

          <h2
            className="display text-2xl mt-4 mb-6"
            style={{ color: INK }}
          >
            Get in touch
          </h2>

          <div className="flex flex-col gap-4 items-center text-sm">
            <a
              href="https://instagram.com/mimaa_creations2"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2"
            >
              <InstagramIcon size={16} />
              @mimaa_creations2
            </a>

            <a
              href="mailto:hello@mimacreations.com"
              className="flex items-center gap-2"
            >
              <Mail size={16} />
              hello@mimacreations.com
            </a>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2"
            >
              <MessageCircle size={16} />
              WhatsApp: +{WHATSAPP_NUMBER}
            </a>
          </div>

          <Link
            to="/enquiry"
            className="btn inline-block text-sm px-6 py-3 mt-8"
            style={{
              background: ROSE,
              color: CREAM,
            }}
          >
            Start a custom order
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
