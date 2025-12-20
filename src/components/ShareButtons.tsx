import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { QRCodeSVG } from "qrcode.react";
import { 
  Link2, 
  Share2, 
  QrCode, 
  Download,
  Mail,
  Smartphone,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateShortUrl, copyShortUrl } from "@/lib/short-url";
import { toast } from "@/hooks/use-toast";

// Custom icons for platforms not in lucide
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const RedditIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

interface ShareButtonsProps {
  shortCode: string | null | undefined;
  title: string | null | undefined;
  compact?: boolean;
  className?: string;
  // Additional details for print view
  fullAddress?: string;
  suburb?: string;
  city?: string;
  province?: string;
}

export function ShareButtons({ 
  shortCode, 
  title, 
  compact = false, 
  className,
  fullAddress,
  suburb,
  city,
  province,
}: ShareButtonsProps) {
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const shortUrl = generateShortUrl(shortCode);
  const shareText = title 
    ? `Check out this Christmas light display: ${title}` 
    : "Check out this amazing Christmas light display!";

  // Check if Web Share API is available
  const canUseWebShare = typeof navigator !== "undefined" && !!navigator.share;

  const handleCopyLink = () => {
    copyShortUrl(shortCode, title);
  };

  const handleNativeShare = async () => {
    if (!canUseWebShare) return;
    
    try {
      await navigator.share({
        title: title || "Christmas Light Display",
        text: shareText,
        url: shortUrl,
      });
    } catch (error) {
      // User cancelled or share failed - only show error if it's not a cancel
      if (error instanceof Error && error.name !== "AbortError") {
        toast({
          title: "Share failed",
          description: "Unable to share. Try copying the link instead.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(title || "Check out this Christmas light display!");
    const body = encodeURIComponent(`${shareText}\n\n${shortUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_self");
  };

  const handlePrintQRCode = () => {
    const displayName = title || "Christmas Light Display";
    const locationLine = [suburb, city, province].filter(Boolean).join(", ");
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        title: "Unable to open print view",
        description: "Please allow popups for this site.",
        variant: "destructive",
      });
      return;
    }

    const svgElement = document.getElementById("qr-code-svg-print") || document.getElementById("qr-code-svg");
    const svgData = svgElement ? new XMLSerializer().serializeToString(svgElement) : "";
    const svgBase64 = svgData ? "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData))) : "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code - ${displayName}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
              padding: 40px;
              max-width: 600px;
              margin: 0 auto;
              color: #1a1a1a;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #e5e5e5;
            }
            .logo {
              max-width: 200px;
              height: auto;
              margin-bottom: 20px;
            }
            .title {
              font-size: 28px;
              font-weight: 700;
              color: #1a1a1a;
              margin-bottom: 8px;
            }
              font-size: 28px;
              font-weight: 700;
              color: #1a1a1a;
              margin-bottom: 8px;
            }
            .address {
              font-size: 16px;
              color: #444;
              margin-bottom: 4px;
            }
            .location {
              font-size: 14px;
              color: #666;
            }
            .qr-section {
              text-align: center;
              padding: 30px 0;
            }
            .qr-container {
              display: inline-block;
              padding: 20px;
              border: 3px solid #1a1a1a;
              border-radius: 12px;
              background: white;
            }
            .qr-code {
              width: 200px;
              height: 200px;
            }
            .scan-text {
              margin-top: 20px;
              font-size: 16px;
              font-weight: 600;
              color: #1a1a1a;
            }
            .url-section {
              text-align: center;
              margin-top: 20px;
              padding: 15px;
              background: #f5f5f5;
              border-radius: 8px;
            }
            .url-label {
              font-size: 12px;
              color: #666;
              margin-bottom: 6px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .url {
              font-size: 18px;
              font-weight: 600;
              color: #1a1a1a;
              font-family: monospace;
              word-break: break-all;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #888;
            }
            @media print {
              body {
                padding: 20px;
              }
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${window.location.origin}/images/lekkerlights-logo.png" alt="Lekker Lights" class="logo" />
            <h1 class="title">${displayName}</h1>
            ${fullAddress ? `<div class="address">${fullAddress}</div>` : ''}
            ${locationLine ? `<div class="location">${locationLine}</div>` : ''}
          </div>
          
          <div class="qr-section">
            <div class="qr-container">
              ${svgBase64 ? `<img src="${svgBase64}" alt="QR Code" class="qr-code" />` : '<div class="qr-code" style="background:#eee;display:flex;align-items:center;justify-content:center;">QR Code</div>'}
            </div>
            <p class="scan-text">Scan to view this display</p>
          </div>
          
          <div class="url-section">
            <div class="url-label">Short URL</div>
            <div class="url">${shortUrl}</div>
          </div>
          
          <div class="footer">
            <p>Find more amazing Christmas light displays at lekkerlights.co.za</p>
          </div>
          
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 12px 24px; font-size: 16px; background: #1a1a1a; color: white; border: none; border-radius: 8px; cursor: pointer;">
              Print This Page
            </button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const downloadQRCode = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 300, 300);
        ctx.drawImage(img, 0, 0, 300, 300);
      }
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `lekker-lights-${shortCode || 'qr'}.png`;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: WhatsAppIcon,
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shortUrl}`)}`,
      color: "hover:bg-[#25D366]/10 hover:text-[#25D366]",
    },
    {
      name: "Telegram",
      icon: TelegramIcon,
      url: `https://t.me/share/url?url=${encodeURIComponent(shortUrl)}&text=${encodeURIComponent(shareText)}`,
      color: "hover:bg-[#0088cc]/10 hover:text-[#0088cc]",
    },
    {
      name: "Facebook",
      icon: FacebookIcon,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl)}`,
      color: "hover:bg-[#1877F2]/10 hover:text-[#1877F2]",
    },
    {
      name: "X",
      icon: XIcon,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shortUrl)}&text=${encodeURIComponent(shareText)}`,
      color: "hover:bg-foreground/10",
    },
    {
      name: "LinkedIn",
      icon: LinkedInIcon,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shortUrl)}&title=${encodeURIComponent(shareText)}`,
      color: "hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]",
    },
    {
      name: "Reddit",
      icon: RedditIcon,
      url: `https://reddit.com/submit?url=${encodeURIComponent(shortUrl)}&title=${encodeURIComponent(shareText)}`,
      color: "hover:bg-[#FF4500]/10 hover:text-[#FF4500]",
    },
  ];

  if (!shortCode) {
    return null;
  }

  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={className}>
            <Share2 className="h-4 w-4 mr-1.5" />
            Share
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3" align="end">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Share this display</span>
              <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <QrCode className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>QR Code</DialogTitle>
                    <DialogDescription>
                      Scan or download this QR code to share the display
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="p-4 bg-white rounded-lg">
                      <QRCodeSVG
                        id="qr-code-svg"
                        value={shortUrl}
                        size={200}
                        level="H"
                        includeMargin
                      />
                    </div>
                    <code className="text-sm bg-muted px-3 py-1.5 rounded">{shortUrl}</code>
                    <Button onClick={downloadQRCode} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download QR Code
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Native Share Button (mobile) */}
            {canUseWebShare && (
              <Button 
                variant="default" 
                size="sm" 
                className="w-full justify-start"
                onClick={handleNativeShare}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Share...
              </Button>
            )}

            {/* Copy Link Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={handleCopyLink}
            >
              <Link2 className="h-4 w-4 mr-2" />
              Copy Link
            </Button>

            {/* Email Share Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={handleEmailShare}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            
            {/* Social Share Grid */}
            <div className="grid grid-cols-6 gap-1">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center justify-center p-2 rounded-md transition-colors",
                    link.color
                  )}
                  title={`Share on ${link.name}`}
                >
                  <link.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Full display version for listing detail page
  return (
    <div className={cn("space-y-4", className)}>
      {/* Short URL Display */}
      <div className="flex items-center gap-2 flex-wrap">
        <code className="bg-muted px-3 py-1.5 rounded text-sm font-mono">
          {shortUrl}
        </code>
        <Button variant="outline" size="sm" onClick={handleCopyLink}>
          <Link2 className="h-4 w-4 mr-1.5" />
          Copy Link
        </Button>
      </div>
      
      {/* Social Share Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Native Share Button (mobile) */}
        {canUseWebShare && (
          <Button 
            variant="default" 
            size="sm"
            onClick={handleNativeShare}
          >
            <Smartphone className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Share...</span>
          </Button>
        )}

        {/* Email Share Button */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleEmailShare}
        >
          <Mail className="h-4 w-4 mr-1.5" />
          <span className="hidden sm:inline">Email</span>
        </Button>

        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm transition-colors",
              link.color
            )}
            title={`Share on ${link.name}`}
          >
            <link.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{link.name}</span>
          </a>
        ))}
        
        {/* QR Code Button */}
        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <QrCode className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">QR Code</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>QR Code for This Display</DialogTitle>
              <DialogDescription>
                Scan this QR code to view the display, or download/print it to share.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={shortUrl}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              <code className="text-sm bg-muted px-3 py-1.5 rounded">{shortUrl}</code>
              <div className="flex gap-2">
                <Button onClick={downloadQRCode} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={handlePrintQRCode} variant="default">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center max-w-xs">
                Print this QR code and display it at your property so visitors can easily access your listing.
              </p>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Direct Print Button */}
        <Button variant="outline" size="sm" onClick={handlePrintQRCode}>
          <Printer className="h-4 w-4 mr-1.5" />
          <span className="hidden sm:inline">Print QR</span>
        </Button>
      </div>
      
      {/* Hidden QR code for print function */}
      <div className="hidden">
        <QRCodeSVG
          id="qr-code-svg-print"
          value={shortUrl}
          size={200}
          level="H"
          includeMargin
        />
      </div>
    </div>
  );
}