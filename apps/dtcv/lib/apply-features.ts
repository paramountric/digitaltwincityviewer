import { Feature } from "@/app/types";

export function applyFeatures(features: Feature[]) {
  features.forEach((feature) => {
    console.log(feature);
  });
}
