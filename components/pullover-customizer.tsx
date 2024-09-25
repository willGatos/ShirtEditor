"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RotateCw, Download, ExternalLink } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useGoogleFonts } from "@/app/hooks/useGoogleFonts";
import { useTextOverlay } from "@/app/hooks/useTextOverlay";

interface DraggableProps {
  children: React.ReactNode;
  onDrag: (dx: number, dy: number) => void;
  onResize: (width: number, height: number) => void;
  onRotate: (angle: number) => void;
  containerWidth: number;
  containerHeight: number;
}

const Draggable: React.FC<DraggableProps> = ({
  children,
  onDrag,
  onResize,
  onRotate,
  containerWidth,
  containerHeight,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startAngle, setStartAngle] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = ((e.clientX - startPos.x) / containerWidth) * 100;
        const dy = ((e.clientY - startPos.y) / containerHeight) * 100;
        onDrag(dx, dy);
        setStartPos({ x: e.clientX, y: e.clientY });
      } else if (isResizing) {
        const width =
          ((startSize.width + (e.clientX - startPos.x)) / containerWidth) * 100;
        const height =
          ((startSize.height + (e.clientY - startPos.y)) / containerHeight) *
          100;
        onResize(Math.max(5, width), Math.max(5, height));
      } else if (isRotating) {
        const rect = ref.current!.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        onRotate(angle - startAngle);
        setStartAngle(angle);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setIsRotating(false);
    };

    if (isDragging || isResizing || isRotating) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    isResizing,
    isRotating,
    onDrag,
    onResize,
    onRotate,
    startPos,
    startSize,
    startAngle,
    containerWidth,
    containerHeight,
  ]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({
      width: ref.current!.offsetWidth,
      height: ref.current!.offsetHeight,
    });
  };

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRotating(true);
    const rect = ref.current!.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setStartAngle(Math.atan2(e.clientY - centerY, e.clientX - centerX));
  };

  return (
    <div
      ref={ref}
      className="absolute cursor-move"
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      {children}
      {isHovered && (
        <>
          <div className="absolute top-0 left-0 w-full h-full border-2 border-blue-500 pointer-events-none" />
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize"
            onMouseDown={handleResizeStart}
          />
          <div
            className="absolute -top-6 -right-6 w-6 h-6 cursor-pointer"
            onMouseDown={handleRotateStart}
          >
            <RotateCw className="w-full h-full text-blue-500" />
          </div>
        </>
      )}
    </div>
  );
};
const ColorPicker: React.FC<{
  color: string;
  onChange: (color: string) => void;
}> = ({ color, onChange }) => {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);

  useEffect(() => {
    const hslColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    onChange(hslColor);
  }, [hue, saturation, lightness, onChange]);

  return (
    <div className="w-64 h-64 relative">
      <div
        className="w-full h-full"
        style={{
          background: `hsl(${hue}, 100%, 50%)`,
        }}
      >
        <div
          className="w-full h-full"
          style={{
            background:
              "linear-gradient(to bottom, hsl(0, 0%, 100%) 0%, hsla(0, 0%, 100%, 0) 50%, hsla(0, 0%, 0%, 0) 50%, hsl(0, 0%, 0%) 100%), linear-gradient(to right, hsl(0, 0%, 50%) 0%, hsla(0, 0%, 50%, 0) 100%)",
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Cálculo de saturación y luminosidad basados en la posición del clic
            const newSaturation = (x / rect.width) * 100;
            const newLightness = 100 - (y / rect.height) * 100;

            setSaturation(newSaturation);
            setLightness(newLightness);
          }}
        >
          <div
            className="w-4 h-4 rounded-full border-2 border-white absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${saturation}%`,
              top: `${100 - lightness}%`,
            }}
          />
        </div>
      </div>
      <input
        type="range"
        min="0"
        max="360"
        value={hue}
        onChange={(e) => setHue(Number(e.target.value))}
        className="w-full mt-4"
      />
    </div>
  );
};

export function PulloverCustomizerComponent() {
  const { googleFonts, selectedGoogleFont, setSelectedGoogleFont, selectedVariant, setSelectedVariant } = useGoogleFonts();
  const { text, setText, textColor, setTextColor, textPos, textSize, setTextSize, textRotation, setTextRotation,handleTextDrag } = useTextOverlay();
  
  const [image, setImage] = useState<string | null>(null);
  const [imagePos, setImagePos] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 50, height: 50 });
  const [imageRotation, setImageRotation] = useState(0);
  const [font, setFont] = useState("Arial");
  const [customFont] = useState("");
  const pulloverRef = useRef<HTMLDivElement>(null);
  const [orderDescription] = useState(
    "Sample order description"
  );
  const [orderImage] = useState(
    "/placeholder.svg?height=200&width=200"
  );

  const fonts = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Courier",
    "Verdana",
    "Georgia",
    "Palatino",
    "Garamond",
    "Bookman",
    "Comic Sans MS",
    "Trebuchet MS",
    "Arial Black",
    "Impact",
  ];

  useEffect(() => {
    if (customFont) {
      const link = document.createElement("link");
      link.href = `https://fonts.googleapis.com/css?family=${customFont.replaceAll(
        " ",
        "+"
      )}`;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, [customFont]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleImageDrag = (dx: number, dy: number) => {
    setImagePos((prev) => ({
      x: Math.min(Math.max(prev.x + dx, 0), 100),
      y: Math.min(Math.max(prev.y + dy, 0), 100),
    }));
  };

  const downloadAsJPG = async () => {
    if (pulloverRef.current) {
      try {
        const canvas = await html2canvas(pulloverRef.current, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
        });
        const dataURL = canvas.toDataURL("image/jpeg", 1.0);
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "customized_pullover.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error downloading JPG:", error);
        alert("Failed to download JPG. Please try again.");
      }
    }
  };

  const downloadAsPDF = async () => {
    if (pulloverRef.current) {
      try {
        const canvas = await html2canvas(pulloverRef.current, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
        });
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [canvas.width, canvas.height],
        });
        pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
        pdf.save("customized_pullover.pdf");
      } catch (error) {
        console.error("Error downloading PDF:", error);
        alert("Failed to download PDF. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-4">
      <div
        className="w-full md:w-auto relative bg-gray-100"
        style={{ height: "100vh", width: "512px", maxWidth: "100%" }}
        ref={pulloverRef}
      >
        {/* Pullover base */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image_1024-uwDKYkgxkpsCm4laIvnvkQnxLcm6xa.png')",
          }}
        />

        {/* Uploaded image */}
        {image && (
          <div
            style={{
              position: "absolute",
              top: `${imagePos.y}%`,
              left: `${imagePos.x}%`,
              width: `${imageSize.width}%`,
              height: `${imageSize.height}%`,
              transform: `rotate(${imageRotation}rad)`,
            }}
          >
            <Draggable
              onDrag={handleImageDrag}
              onResize={(width, height) => setImageSize({ width, height })}
              onRotate={(angle) => setImageRotation((prev) => prev + angle)}
              containerWidth={pulloverRef.current?.offsetWidth || 512}
              containerHeight={
                pulloverRef.current?.offsetHeight || window.innerHeight
              }
            >
              <img
                src={image}
                alt="Uploaded design"
                className="w-full h-full object-contain"
                crossOrigin="anonymous"
              />
            </Draggable>
          </div>
        )}

        {/* Text overlay */}
        {text && (
          <div
            style={{
              position: "absolute",
              top: `${textPos.y}%`,
              left: `${textPos.x}%`,
              width: `${textSize.width}%`,
              height: `${textSize.height}%`,
              transform: `rotate(${textRotation}rad)`,
            }}
          >
            <Draggable
              onDrag={handleTextDrag}
              onResize={(width, height) => setTextSize({ width, height })}
              onRotate={(angle) => setTextRotation((prev) => prev + angle)}
              containerWidth={pulloverRef.current?.offsetWidth || 512}
              containerHeight={
                pulloverRef.current?.offsetHeight || window.innerHeight
              }
            >
              <div
                className="w-full h-full font-bold text-center flex items-center justify-center"
                style={{
                  fontSize: `${
                    Math.min(textSize.width, textSize.height) / 2
                  }vw`,
                  fontFamily: selectedGoogleFont?.family || font,
                  fontWeight: selectedVariant,
                  color: textColor,
                }}
              >
                {text}
              </div>
            </Draggable>
          </div>
        )}
      </div>

      <div className="w-full md:w-1/2 space-y-4">
        <div>
          <Label htmlFor="image-upload">Subir Imagen</Label>
          <Input
            id="image-upload"
            type="file"
            onChange={handleImageUpload}
            accept="image/*"
          />
        </div>

        <div>
          <Label htmlFor="text-neutral-200 dark:text-neutral-800">Insertar Texto</Label>
          <Input
            id="text-neutral-200 dark:text-neutral-800"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text"
          />
        </div>

        <div>
          <Label htmlFor="font-select">Font</Label>
          <Select onValueChange={setFont} value={font}>
            <SelectTrigger>
              <SelectValue placeholder="Select a font" />
            </SelectTrigger>
            <SelectContent>
              {fonts.map((f) => (
                <SelectItem key={f} value={f} style={{ fontFamily: f }}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="google-font-select">Tipografias de Google</Label>
          <Select 
            onValueChange={(value) => {
              const font = googleFonts.find(f => f.family === value);
              setSelectedGoogleFont(font || null);
              setSelectedVariant('regular');
            }} 
            value={selectedGoogleFont?.family || ''}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a Google Font" />
            </SelectTrigger>
            <SelectContent>
              {googleFonts.map((f) => (
                <SelectItem key={f.family} value={f.family}>{f.family}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Button asChild variant="outline">
            <a
              href="https://www.remove.bg/es"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              Visita Google Fonts
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>

        {selectedGoogleFont && (
          <div>
            <Label htmlFor="variant-select">Variaciones de la Tipografia</Label>
            <Select onValueChange={setSelectedVariant} value={selectedVariant}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona Variante" />
              </SelectTrigger>
              <SelectContent>
                {selectedGoogleFont.variants.map((variant) => (
                  <SelectItem key={variant} value={variant}>{variant}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div>
          <Label>Color del Texto</Label>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: textColor }}
                />
                {textColor}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Elige un Color</DialogTitle>
              </DialogHeader>
              <ColorPicker color={textColor} onChange={setTextColor} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex space-x-4">
          <Button onClick={downloadAsJPG} className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Descargar en JPG
          </Button>
          <Button onClick={downloadAsPDF} className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Descargar en PDF
          </Button>
        </div>

        <div>
          <Label>Descripcion de la Orden</Label>
          <p>{orderDescription}</p>
        </div>

        <div>
          <Label>Image Orden</Label>
          <img src={orderImage} alt="Order" className="w-full max-w-xs" />
          <Button asChild className="mt-2">
            <a href={orderImage} download>
              Descarga Imagen de la Orden
            </a>
          </Button>
        </div>

        <div>
          <Button asChild variant="outline">
            <a
              href="https://www.remove.bg/es"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              Visit remove.bg
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
