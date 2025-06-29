"use client";

import { CardContainer, CardBody, CardItem } from "./ui/card"; // Adjust the import path as per your project
import { LucideCode, LucideUsers, LucideZap, LucideShieldCheck } from "lucide-react";

const features = [
  {
    icon: <LucideCode size={40} className="text-blue-500 mb-4" />,
    title: "Open Source Collaboration",
    description:
      "Work together on exciting open-source projects. Contribute, review, and grow your skills.",
  },
  {
    icon: <LucideUsers size={40} className="text-green-500 mb-4" />,
    title: "Community Connections",
    description:
      "Join a vibrant developer network. Expand your circle and find your next co-founder or mentor.",
  },
  {
    icon: <LucideZap size={40} className="text-purple-500 mb-4" />,
    title: "Lightning-Fast Learning",
    description:
      "Discover bite-sized tutorials and hands-on labs tailored to your skill level.",
  },
  {
    icon: <LucideShieldCheck size={40} className="text-rose-500 mb-4" />,
    title: "Secure & Trustworthy",
    description:
      "Our platform is built with privacy and security as top priorities.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-zinc-50 to-zinc-100 px-4">
      <div className="mx-auto max-w-7xl text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-800 sm:text-4xl">
          Features for Developers
        </h2>
        <p className="mt-2 text-zinc-600">Empowering you with tools, connections, and knowledge.</p>
      </div>

      <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 place-items-center">
        {features.map((feature, index) => (
          <CardContainer key={index} className="w-full max-w-xs">
            <CardBody className="bg-white border border-zinc-200 rounded-2xl shadow-md hover:shadow-xl p-6 h-full w-full flex flex-col items-center justify-center text-center">
              <CardItem translateZ={50}>{feature.icon}</CardItem>
              <CardItem translateZ={40} className="text-xl font-semibold mb-2 text-zinc-800">
                {feature.title}
              </CardItem>
              <CardItem translateZ={30} className="text-zinc-600 text-sm leading-relaxed">
                {feature.description}
              </CardItem>
            </CardBody>
          </CardContainer>
        ))}
      </div>
    </section>
  );
}
