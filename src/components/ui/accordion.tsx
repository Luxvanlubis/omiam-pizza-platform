
/**
 * Valide et sécurise un chemin de fichier
 * @param {string} userPath - Chemin fourni par l'utilisateur
 * @param {string} basePath - Chemin de base autorisé
 * @returns {string} - Chemin sécurisé
 */
function validateSecurePath(userPath, basePath = process.cwd()) { if (!userPath || typeof userPath !== 'string') { throw new Error('Chemin invalide'); } // Normaliser le chemin et vérifier qu'il reste dans le répertoire autorisé const normalizedPath = path.normalize(path.join(basePath, userPath)); const normalizedBase = path.normalize(basePath); if (!normalizedPath.startsWith(normalizedBase)) { throw new Error('Accès au chemin non autorisé'); } return normalizedPath;
}
"use client" import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "lucide-react" import { cn } from "../../lib/utils" function Accordion({ ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) { return <AccordionPrimitive.Root data-slot="accordion" {...props} />
} function AccordionItem({ className, ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) { return ( <AccordionPrimitive.Item data-slot="accordion-item" className={cn("border-b last:border-b-0", className)} {...props} /> )
} function AccordionTrigger({ className, children, ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) { return ( <AccordionPrimitive.Header className="flex"> <AccordionPrimitive.Trigger data-slot="accordion-trigger" className={cn( "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180", className )} {...props} > {children} <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" /> </AccordionPrimitive.Trigger> </AccordionPrimitive.Header> )
} function AccordionContent({ className, children, ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) { return ( <AccordionPrimitive.Content data-slot="accordion-content" className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm" {...props} > <div className={cn("pt-0 pb-4", className)}>{children}</div> </AccordionPrimitive.Content> )
} export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
