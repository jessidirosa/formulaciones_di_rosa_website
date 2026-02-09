'use client'

import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { ImagePlus, Trash, Loader2 } from 'lucide-react';

interface AdminImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    onRemove: () => void;
}

export default function AdminImageUpload({ value, onChange, onRemove }: AdminImageUploadProps) {
    return (
        <div className="space-y-4 w-full text-left">
            <div className="flex flex-wrap items-center gap-4">
                <CldUploadWidget
                    // Prioriza la variable de entorno de Vercel
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "dirosa_presets"}
                    onSuccess={(result: any) => {
                        if (result.info && typeof result.info !== 'string') {
                            onChange(result.info.secure_url);
                        }
                    }}
                    options={{
                        maxFiles: 1,
                        clientAllowedFormats: ["jpg", "png", "webp", "jpeg"],
                        theme: "minimal"
                    }}
                >
                    {({ open, isLoading }: { open: () => void, isLoading?: boolean }) => {
                        return (
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isLoading}
                                className="border-dashed border-2 border-[#D6D6C2] h-32 w-32 flex flex-col gap-2 rounded-2xl hover:bg-[#F5F5F0] transition-all active:scale-95"
                                onClick={() => open()}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-[#A3B18A]" />
                                ) : (
                                    <ImagePlus className="h-6 w-6 text-[#A3B18A]" />
                                )}
                                <span className="text-[10px] uppercase font-bold text-[#5B6350]">
                                    {isLoading ? "Cargando..." : "Subir Foto"}
                                </span>
                            </Button>
                        );
                    }}
                </CldUploadWidget>

                {value && (
                    <div className="relative h-32 w-32 rounded-2xl overflow-hidden border border-[#E9E9E0] shadow-md group">
                        <img src={value} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                type="button"
                                onClick={onRemove}
                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all shadow-xl transform scale-90 group-hover:scale-100"
                            >
                                <Trash className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <p className="text-[9px] text-[#A3B18A] uppercase font-bold tracking-widest">
                * Formatos recomendados: JPG, PNG o WEBP (Máx 2MB)
            </p>
        </div>
    );
}