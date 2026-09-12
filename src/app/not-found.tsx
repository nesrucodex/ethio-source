import { EmptyState } from "@/components/shared/states";
export default function NotFound() {
  return (
    <EmptyState
      title="This page took a different route."
      description="Let’s get you back to the collection."
    />
  );
}
