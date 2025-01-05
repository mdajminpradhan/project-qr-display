import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import QRCode from "react-qr-code";

const QRCodeModal = ({ isOpen, setIsOpen }) => {
  console.log("🚀 ~ QRCodeModal ~ isOpen:", isOpen);
  return (
    <Dialog
      open={!!isOpen ? true : false}
      as="div"
      className="relative z-10 focus:outline-none"
      onClose={() => setIsOpen(null)}
      __demoMode
    >
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-black bg-opacity-50">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-md rounded-xl bg-white p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
          >
            <DialogTitle
              as="h3"
              className="text-xl text-center font-medium mb-10 border-b pb-2"
            >
              Scan for details
            </DialogTitle>

            <QRCode
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={JSON.stringify(isOpen)}
              viewBox={`0 0 256 256`}
            />

            <div className="mt-4">
              <Button
                className="bg-amber-400 mt-5 rounded-lg w-full py-2.5 text-white"
                onClick={() => setIsOpen(null)}
              >
                Got it, thanks!
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default QRCodeModal;
