export default function ApplicationPage({ params }: { params: { id: string } }) {
  return <div className="p-8">Application {params.id} — Phase 4</div>;
}
