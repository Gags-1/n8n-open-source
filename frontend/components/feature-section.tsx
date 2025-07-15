import {
  Clipboard,
  File,
  Signature,
  Table,
  Bot,
  Brain,
  MessageSquare,
  Network,
} from "lucide-react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento";
import Image from "next/image";

export default function FeatureSection() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-black">
      <div className="mb-6">
        <div className="w-10/12 mx-auto">
          <h2 className="text-white text-5xl font-wagner text-balance text-center">
            Responsible AI Agents That Work for {""}
            <span className="relative inline-block">
              You
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-accent-1"></div>
            </span>
          </h2>
        </div>
        <div className="">
          <p className="text-neutral-300 text-sm font-sans text-center mt-4 max-w-2xl mx-auto">
            Our AI agents are purpose-built to supercharge your workflow while
            upholding the highest standards of transparency, security, and
            ethical responsibility. We give you full control over your data and
            decisions, ensuring every AI action supports your productivity
            without compromising trust or integrity.
          </p>
        </div>
      </div>
      <BentoGrid className="max-w-5xl mx-auto md:auto-rows-[25rem]">
        {items.map((item, i) => (
          <BentoGridItem
            key={i}
            title={item.title}
            description={item.description}
            header={item.header}
            className={item.className}
            icon={item.icon}
          />
        ))}
      </BentoGrid>
    </div>
  );
}

const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl   dark:bg-dot-white/[0.2] bg-dot-black/[0.2] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]  border border-transparent dark:border-white/[0.2] bg-neutral-100 dark:bg-black"></div>
);

const FeatureImage = () => {
  return (
    <Image
      src={"/autonomous.png"}
      width={500}
      height={500}
      alt="Autonomous Task Execution"
      className="w-full h-full object-cover rounded-lg"
    />
  );
};

const items = [
  {
    title: "Autonomous Task Execution",
    description:
      "Leverage AI agents that independently manage repetitive and time-consuming tasks—boosting operational efficiency and freeing your team to focus on innovation and strategy.",
    header: <FeatureImage />,
    className: "md:col-span-2",
    icon: <Bot className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Self-Optimizing Intelligence",
    description:
      "Our AI agents learn and adapt continuously from usage patterns, enabling smarter, faster, and more personalized performance with every interaction.",
    header: <FeatureImage />,
    className: "md:col-span-1",
    icon: <Brain className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Conversational AI Control",
    description:
      "Create, manage, and customize automated workflows using natural language. No technical skills required—just speak or type your intent.",
    header: <FeatureImage />,
    className: "md:col-span-1",
    icon: <MessageSquare className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Unified Toolchain Integration",
    description:
      "Integrate your AI agents effortlessly with the tools you already use. Streamline complex operations by connecting apps, APIs, and platforms through intelligent automation.",
    header: <FeatureImage />,
    className: "md:col-span-2",
    icon: <Network className="h-4 w-4 text-neutral-500" />,
  },
];


