import { cn } from "@/lib/utils";

/** 입력 칸 아래에 표시하는 유효성 검사 오류 문구 (Design.md: Error text below in semantic red) */
function FieldError({
  id,
  message,
  className,
}: {
  id?: string;
  message?: string;
  className?: string;
}) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className={cn("mt-1 text-left text-[11px] font-medium text-danger", className)}
    >
      {message}
    </p>
  );
}

export { FieldError };
