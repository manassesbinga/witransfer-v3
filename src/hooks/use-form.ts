import { useState, useCallback, FormEvent } from 'react';

interface UseFormProps<T> {
    initialValues: T;
    onSubmit: (values: T) => Promise<void>;
}

export function useForm<T>({ initialValues: initialValues, onSubmit }: UseFormProps<T>) {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = useCallback((key: keyof T, value: any) => {
        setValues((prev) => ({ ...prev, [key]: value }));
        // Clear error when changing
        setErrors((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }, []);

    const setError = useCallback((key: keyof T, message: string) => {
        setErrors((prev) => ({ ...prev, [key]: message }));
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(values);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        values,
        errors,
        isSubmitting,
        handleChange,
        setError,
        handleSubmit,
    };
}
