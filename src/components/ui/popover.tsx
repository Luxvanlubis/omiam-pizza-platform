
/**
 * Valide et sécurise un chemin de fichier
 * @param {string} userPath - Chemin fourni par l'utilisateur
 * @param {string} basePath - Chemin de base autorisé
 * @returns {string} - Chemin sécurisé
 */
function validateSecurePath(userPath, basePath = process.cwd()) { if (!userPath || typeof userPath !== 'string') { throw new Error('Chemin invalide'); } // Normaliser le chemin et vérifier qu'il reste dans le répertoire autorisé const normalizedPath = path.normalize(path.join(basePath, userPath)); const normalizedBase = path.normalize(basePath); if (!normalizedPath.startsWith(normalizedBase)) { throw new Error('Accès au chemin non autorisé'); } return normalizedPath;
}
"use client" import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover" import { cn } from "../../lib/utils" function Popover({ ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) { return <PopoverPrimitive.Root data-slot="popover" {...props} />
} function PopoverTrigger({ ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) { return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
} function PopoverContent({ className, align = "center", sideOffset = 4, ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) { return ( <PopoverPrimitive.Portal> <PopoverPrimitive.Content data-slot="popover-content" align={align} sideOffset={sideOffset} className={cn( "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden", className )} {...props} /> </PopoverPrimitive.Portal> )
} function PopoverAnchor({ ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) { return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
} export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
