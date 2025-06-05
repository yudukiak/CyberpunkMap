export default function Loading() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-8 border-red-600 border-t-gray-600" />
    </div>
  );
}