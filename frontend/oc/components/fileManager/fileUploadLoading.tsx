import Portal from "../portal";
import LoadingThreeDotsPulse from "../animations/loading";

interface LoadingProps {
  isOpen: boolean;
}

export default function FileUploadLoading({ isOpen }: LoadingProps) {
  return (
    <div>
      {isOpen && (
        <Portal>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <LoadingThreeDotsPulse />
          </div>
        </Portal>
      )}
    </div>
  );
}
