"use client";

import { useId, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const languages = [
  { value: "en", label: "EN", name: "English" },
  { value: "am", label: "AM", name: "Amharic" },
  { value: "om", label: "OM", name: "Afaan Oromoo" },
] as const;
type Language = (typeof languages)[number]["value"];
type LanguageFieldProps = {
  name: string;
  label: string;
  required?: boolean;
  defaultValues?: Partial<Record<Language, string>>;
};

export function TranslatedInput(props: LanguageFieldProps) {
  return <LanguageField {...props} control={Input} />;
}

export function TranslatedTextarea(props: LanguageFieldProps) {
  return <LanguageField {...props} control={Textarea} />;
}

function LanguageField({
  name,
  label,
  required,
  defaultValues = {},
  control: Control,
}: LanguageFieldProps & { control: typeof Input | typeof Textarea }) {
  const id = useId();
  const [language, setLanguage] = useState("en");
  const [values, setValues] = useState(() => ({
    en: defaultValues.en ?? "",
    am: defaultValues.am ?? "",
    om: defaultValues.om ?? "",
  }));
  const [invalid, setInvalid] = useState<{
    name: string;
    message: string;
  } | null>(null);
  const handlingInvalid = useRef(false);
  const completed = languages.filter((lang) => values[lang.value].length > 0);
  return (
    <section className="language-fields" aria-labelledby={`${id}-title`}>
      <Tabs
        value={language}
        onValueChange={setLanguage}
        onInvalidCapture={(event) => {
          // Cancel native focus on hidden controls; reveal the first invalid language instead.
          event.preventDefault();
          if (handlingInvalid.current) return;
          handlingInvalid.current = true;
          const input = event.target as HTMLInputElement | HTMLTextAreaElement;
          const locale = input.dataset.language!;
          const shouldFocus = input.form?.querySelector(":invalid") === input;
          setLanguage(locale);
          setInvalid({
            name: input.name,
            message: `Complete ${label.toLowerCase()} in ${languages.find((lang) => lang.value === locale)!.name}.`,
          });
          requestAnimationFrame(() => {
            if (shouldFocus) input.focus();
            handlingInvalid.current = false;
          });
        }}
      >
        <div className="language-fields-heading">
          <FieldLabel id={`${id}-title`} htmlFor={`${id}-${name}-${language}`}>
            {label}
          </FieldLabel>
          <TabsList
            className="language-tabs-list"
            aria-label={`${label} language`}
          >
            {languages.map((lang) => {
              const complete = completed.some(
                (item) => item.value === lang.value,
              );
              return (
                <TabsTrigger
                  key={lang.value}
                  value={lang.value}
                  title={lang.name}
                  aria-label={`${lang.name}${complete ? ", complete" : ", incomplete"}`}
                >
                  <span lang={lang.value}>{lang.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
        {languages.map((lang) => (
          <TabsContent
            key={lang.value}
            value={lang.value}
            forceMount
            className="pt-1 data-[state=inactive]:hidden"
          >
            <Field
              data-invalid={
                invalid?.name === `${name}-${lang.value}` || undefined
              }
            >
              <Control
                id={`${id}-${name}-${lang.value}`}
                name={`${name}-${lang.value}`}
                data-language={lang.value}
                lang={lang.value}
                required={required}
                value={values[lang.value]}
                aria-labelledby={`${id}-title`}
                aria-invalid={
                  invalid?.name === `${name}-${lang.value}` || undefined
                }
                aria-describedby={
                  invalid?.name === `${name}-${lang.value}`
                    ? `${id}-error`
                    : undefined
                }
                onChange={(event) => {
                  setValues((current) => ({
                    ...current,
                    [lang.value]: event.target.value,
                  }));
                  if (invalid?.name === `${name}-${lang.value}`)
                    setInvalid(null);
                }}
              />
            </Field>
          </TabsContent>
        ))}
      </Tabs>
      {invalid ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {invalid.message}
        </p>
      ) : null}
    </section>
  );
}
