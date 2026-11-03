import Image from "next/image"
import { about } from "@/lib/content"
import { Section } from "@/components/section"

export function About() {
  return (
    <Section id="about" eyebrow={about.eyebrow} title={about.title} className="border-t border-border">
      <div className="grid items-center gap-10 md:grid-cols-[1fr_16rem] lg:gap-16">
        <div className="reveal space-y-5 text-lg leading-relaxed text-foreground/85">
          {about.paragraphs.map((p) => (
            <p key={p} className="max-w-2xl">
              {p}
            </p>
          ))}
          <p className="max-w-2xl text-sm text-muted-foreground">{about.education}</p>
        </div>

        <div className="reveal mx-auto w-48 md:w-full">
          <Image
            src="/avatar-thailand.jpeg"
            alt="Portrait of Nguyen Tran"
            width={512}
            height={511}
            className="aspect-square w-full rounded-tile object-cover"
          />
        </div>
      </div>
    </Section>
  )
}
