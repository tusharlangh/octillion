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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-100">
            <LoadingThreeDotsPulse />
          </div>
        </Portal>
      )}
    </div>
  );
}
