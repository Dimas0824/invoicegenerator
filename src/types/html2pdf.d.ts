type Html2PdfInstance = {
  set: (options: unknown) => Html2PdfInstance;
  from: (element: HTMLElement) => Html2PdfInstance;
  save: () => Promise<void>;
};

type Html2PdfFactory = () => Html2PdfInstance;

declare global {
  interface Window {
    html2pdf?: Html2PdfFactory;
  }
}

export {};
