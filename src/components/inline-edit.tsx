"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 인라인 수정 텍스트 (내 링크 페이지의 표시 이름·username·소개글)
 * - 보기: 텍스트에 커서를 올리면 옆에 작은 연필 아이콘이 뜬다. 텍스트나 아이콘을 누르면 수정 상태.
 * - 수정: 입력 칸으로 바뀐다. 한 줄은 Enter, 여러 줄은 Ctrl/⌘+Enter로 저장, Esc로 취소, 바깥을 누르면 저장.
 * - 저장: onSave가 오류 문구를 돌려주면 입력 칸 아래에 표시하고 수정 상태를 유지한다.
 */
export function InlineEditableText({
  value,
  onSave,
  label,
  multiline = false,
  placeholder,
  maxLength,
  prefix,
  normalize,
  className,
  inputClassName,
  emptyText,
  children,
}: {
  value: string;
  /** 저장. 성공하면 null, 실패하면 오류 문구 */
  onSave: (next: string) => Promise<string | null>;
  /** 화면 읽기 프로그램용 이름 (예: "표시 이름") */
  label: string;
  multiline?: boolean;
  placeholder?: string;
  maxLength?: number;
  /** 입력 칸 앞에 붙는 고정 글자 (예: "@") */
  prefix?: string;
  /** 입력할 때 바로 바꿔 줄 규칙 (예: 소문자) */
  normalize?: (raw: string) => string;
  /** 보기 상태 텍스트 스타일 */
  className?: string;
  /** 입력 칸 스타일 */
  inputClassName?: string;
  /** 값이 비었을 때 보기 상태에 보여줄 안내 */
  emptyText?: string;
  /** 보기 상태에서 value 대신 그릴 내용 */
  children?: ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const errorId = useId();

  // 수정 시작하면 입력 칸에 포커스하고 끝으로 커서를 옮긴다
  useEffect(() => {
    if (!editing) return;
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }, [editing]);

  const start = () => {
    setDraft(value);
    setError(null);
    setEditing(true);
  };

  const cancel = () => {
    setDraft(value);
    setError(null);
    setEditing(false);
  };

  const commit = async () => {
    if (saving) return;
    const next = draft.trim();
    if (next === value.trim()) {
      cancel();
      return;
    }
    setSaving(true);
    const message = await onSave(next);
    setSaving(false);
    if (message) {
      setError(message);
      // 실패하면 다시 고칠 수 있게 포커스를 돌려준다
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }
    setError(null);
    setEditing(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      cancel();
    } else if (event.key === "Enter" && (!multiline || event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void commit();
    }
  };

  if (!editing) {
    const isEmpty = !value.trim();
    return (
      <span
        role="button"
        tabIndex={0}
        aria-label={`${label} 수정`}
        onClick={start}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            start();
          }
        }}
        className={cn(
          "group/inline relative inline-flex max-w-full cursor-text items-start justify-center rounded-[6px] px-1.5 outline-none transition-colors duration-200 ease-punch hover:bg-winter/[0.06] focus-visible:bg-winter/[0.06] focus-visible:ring-2 focus-visible:ring-hearth/60",
          className
        )}
      >
        <span className={cn("min-w-0", isEmpty && "text-winter/40 italic")}>
          {isEmpty ? (emptyText ?? placeholder) : (children ?? value)}
        </span>
        {/* 커서를 올리면 뜨는 작은 수정 아이콘 (텍스트 밖에 띄워 가운데 정렬을 흔들지 않음) */}
        <Pencil
          aria-hidden="true"
          className="pointer-events-none absolute top-[0.35em] -right-4 h-3 w-3 text-hearth opacity-0 transition-opacity duration-200 ease-punch group-hover/inline:opacity-100 group-focus-visible/inline:opacity-100"
        />
      </span>
    );
  }

  const Field = multiline ? "textarea" : "input";
  return (
    <span className="flex w-full flex-col items-stretch gap-1">
      <span className="flex items-start gap-1.5">
        <span
          className={cn(
            "flex min-w-0 flex-1 items-center gap-1 rounded-[8px] bg-winter/[0.08] px-2 ring-2 ring-hearth/70 transition-shadow",
            error && "ring-danger/80"
          )}
        >
          {prefix && <span className="shrink-0 font-mono text-winter/50">{prefix}</span>}
          <Field
            ref={inputRef}
            value={draft}
            maxLength={maxLength}
            rows={multiline ? 3 : undefined}
            placeholder={placeholder}
            aria-label={label}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            disabled={saving}
            onChange={(event) => setDraft(normalize ? normalize(event.target.value) : event.target.value)}
            onKeyDown={onKeyDown}
            onBlur={(event) => {
              // 저장·취소 버튼으로 포커스가 옮겨간 경우는 그 버튼이 처리한다
              const next = event.relatedTarget as HTMLElement | null;
              if (next?.dataset.inlineAction) return;
              void commit();
            }}
            className={cn(
              "min-w-0 flex-1 resize-none bg-transparent py-1 text-winter outline-none placeholder:text-winter/35",
              inputClassName
            )}
          />
        </span>
        <span className={cn("flex shrink-0 gap-1", multiline ? "flex-col pt-0.5" : "items-center self-center")}>
          <button
            type="button"
            data-inline-action="save"
            onClick={() => void commit()}
            disabled={saving}
            aria-label={`${label} 저장`}
            className="inline-flex size-7 cursor-pointer items-center justify-center rounded-[6px] bg-hearth text-crow transition-colors hover:bg-hearth-deep disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          </button>
          <button
            type="button"
            data-inline-action="cancel"
            onClick={cancel}
            disabled={saving}
            aria-label={`${label} 수정 취소`}
            className="inline-flex size-7 cursor-pointer items-center justify-center rounded-[6px] bg-winter/10 text-winter/70 transition-colors hover:bg-winter/20 hover:text-winter"
          >
            <X className="size-3.5" />
          </button>
        </span>
      </span>
      {error ? (
        <span id={errorId} role="alert" className="text-left text-[11px] font-medium text-danger">
          {error}
        </span>
      ) : (
        <span className="text-left text-[10px] text-winter/40">
          {multiline ? "Ctrl+Enter 저장 · Esc 취소" : "Enter 저장 · Esc 취소"}
        </span>
      )}
    </span>
  );
}
