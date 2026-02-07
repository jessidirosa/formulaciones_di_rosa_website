'use client'

import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { ImagePlus, Trash } from 'lucide-react';

interface AdminImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    onRemove: () => void;
}

export default function AdminImageUpload({ value, onChange, onRemove }: AdminImageUploadProps) {
    return (
        <div className="space-y-4 w-full text-left">
            <div className="flex items-center gap-4">
                <CldUploadWidget
                    // Usamos el preset del código o uno de la variable de entorno
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "dirosa_presets"}
                    onSuccess={(result: any) => {
                        if (result.info && typeof result.info !== 'string') {
                            onChange(result.info.secure_url);
                        }
                    }}
                >
                    {({ open }: { open: () => void }) => {
                        return (
                            <Button
                                type="button"
                                variant="outline"
                                className="border-dashed border-2 border-[#D6D6C2] h-32 w-32 flex flex-col gap-2 rounded-2xl hover:bg-[#F5F5F0]"
                                onClick={() => open()}
                            >
                                <ImagePlus className="h-6 w-6 text-[#A3B18A]" />
                                <span className="text-[10px] uppercase font-bold text-[#5B6350]">Subir Foto</span>
                            </Button>
                        );
                    }}
                </CldUploadWidget>

                {value && (
                    <div className="relative h-32 w-32 rounded-2xl overflow-hidden border border-[#E9E9E0] shadow-sm">
                        <img src={value} alt="Preview" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={onRemove}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        >
                            <Trash className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}