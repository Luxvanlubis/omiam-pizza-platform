'use client';

import React, { forwardRef, ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle } from 'lucide-react';

// Types de base
interface BaseFieldProps { id: string; label: string; required?: boolean; error?: string; success?: string; description?: string; className?: string;
}

// Composant de base pour les champs de formulaire
interface FormFieldProps extends BaseFieldProps { children: ReactNode;
}

export function FormField({ id, label, required = false, error, success, description, className = '', children
}: FormFieldProps) { const errorId = error ? `${id}-error` : undefined; const descriptionId = description ? `${id}-description` : undefined; const successId = success ? `${id}-success` : undefined; const ariaDescribedBy = [descriptionId, errorId, successId] .filter(Boolean) .join(' ') || undefined; return ( <div className={`space-y-2 ${className}`}> <Label htmlFor={id} className={`block text-sm font-medium ${ error ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300' }`} > {label} {required && ( <span className="text-red-500 ml-1" aria-label="requis"> * </span> )} </Label> {description && ( <p id={descriptionId} className="text-sm text-gray-600 dark:text-gray-400"> {description} </p> )} <div className="relative"> {/* Clone l'enfant avec les props d'accessibilité */} {React.isValidElement(children) ? React.cloneElement(children as React.ReactElement<any>, { id, 'aria-describedby': ariaDescribedBy, 'aria-invalid': error ? 'true' : 'false', 'aria-required': required, className: `${ (children.props as any).className'' } ${ error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : success ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : 'focus:border-red-500 focus:ring-red-500' }` }) : children } {/* Icône de statut */} {(error || success) && ( <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"> {error && ( <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" /> )} {success && ( <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" /> )} </div> )} </div> {/* Messages d'erreur */} {error && ( <p id={errorId} className="text-sm text-red-600 dark:text-red-400" role="alert"> {error} </p> )} {/* Messages de succès */} {success && ( <p id={successId} className="text-sm text-green-600 dark:text-green-400" role="status"> {success} </p> )} </div> );
}

// Champ de saisie de texte accessible
interface AccessibleInputProps extends BaseFieldProps { type?: 'text' | 'email' |  | 'tel' | 'url' | 'search'; placeholder?: string; value?: string; onChange?: (value: string) => void; onBlur?: () => void; autoComplete?: string; maxLength?: number; minLength?: number; pattern?: string;
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>( ({ id, label, type = 'text', placeholder, value, onChange, onBlur, required = false, error, success, description, className = '', autoComplete, maxLength, minLength, pattern, ...props }, ref) => { return ( <FormField id={id} label={label} required={required} error={error} success={success} description={description} className={className} > <Input ref={ref} type={type} placeholder={placeholder} value={value} onChange={(e) => onChange?.(e.target.value)} onBlur={onBlur} autoComplete={autoComplete} maxLength={maxLength} minLength={minLength} pattern={pattern} {...props} /> </FormField> ); }
);

AccessibleInput.displayName = 'AccessibleInput';

// Zone de texte accessible
interface AccessibleTextareaProps extends BaseFieldProps { placeholder?: string; value?: string; onChange?: (value: string) => void; onBlur?: () => void; rows?: number; maxLength?: number; minLength?: number;
}

export const AccessibleTextarea = forwardRef<HTMLTextAreaElement, AccessibleTextareaProps>( ({ id, label, placeholder, value, onChange, onBlur, required = false, error, success, description, className = '', rows = 4, maxLength, minLength, ...props }, ref) => { return ( <FormField id={id} label={label} required={required} error={error} success={success} description={description} className={className} > <Textarea ref={ref} placeholder={placeholder} value={value} onChange={(e) => onChange?.(e.target.value)} onBlur={onBlur} rows={rows} maxLength={maxLength} minLength={minLength} {...props} /> </FormField> ); }
);

AccessibleTextarea.displayName = 'AccessibleTextarea';

// Composant de formulaire avec gestion des erreurs globales
interface AccessibleFormProps { children: ReactNode; onSubmit?: (e: React.FormEvent) => void; className?: string; globalError?: string; globalSuccess?: string; title?: string; description?: string;
}

export function AccessibleForm({ children, onSubmit, className = '', globalError, globalSuccess, title, description
}: AccessibleFormProps) { const formId = `form-${Math.random().toString(36).substr(2, 9)}`; const errorId = globalError ? `${formId}-error` : undefined; const successId = globalSuccess ? `${formId}-success` : undefined; const descriptionId = description ? `${formId}-description` : undefined; const ariaDescribedBy = [descriptionId, errorId, successId] .filter(Boolean) .join(' ') || undefined; return ( <form onSubmit={onSubmit} className={`space-y-6 ${className}`} aria-describedby={ariaDescribedBy} noValidate > {title && ( <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100"> {title} </h2> )} {description && ( <p id={descriptionId} className="text-gray-600 dark:text-gray-400"> {description} </p> )} {/* Messages globaux */} {globalError && ( <div id={errorId} className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md" role="alert"> <div className="flex items-center"> <AlertCircle className="h-5 w-5 text-red-500 mr-2" aria-hidden="true" /> <p className="text-red-700 dark:text-red-400">{globalError}</p> </div> </div> )} {globalSuccess && ( <div id={successId} className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md" role="status"> <div className="flex items-center"> <CheckCircle className="h-5 w-5 text-green-500 mr-2" aria-hidden="true" /> <p className="text-green-700 dark:text-green-400">{globalSuccess}</p> </div> </div> )} {children} </form> );
}