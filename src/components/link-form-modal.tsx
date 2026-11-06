"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Plus, Save } from "lucide-react";
import { LINK_ICON_OPTIONS, type LinkItem } from "@/data/links";
import { linkFormSchema, type LinkFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinkIcon } from "@/components/link-icon";

interface LinkFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLink: LinkItem | null;
  onSave: (linkData: Omit<LinkItem, "id">, id?: string) => void;
}

const BADGE_PRESETS = ["", "NEW", "FEATURED", "HOT", "OPEN"];

export function LinkFormModal({
  open,
  onOpenChange,
  initialLink,
  onSave,
}: LinkFormModalProps) {
  const isEditing = Boolean(initialLink);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitted },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    // 처음 제출 전에는 조용히, 제출 후에는 입력할 때마다 다시 검사
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      title: initialLink?.title ?? "",
      subtitle: initialLink?.subtitle ?? "",
      href: initialLink?.href ?? "https://",
      iconType: initialLink?.iconType ?? "link",
      badge: initialLink?.badge ?? "",
      variant: initialLink?.variant ?? "glass",
    },
  });

  const iconType = useWatch({ control, name: "iconType" });
  const badge = useWatch({ control, name: "badge" });
  const variant = useWatch({ control, name: "variant" });

  const onSubmit = (values: LinkFormValues) => {
    onSave(
      {
        title: values.title,
        subtitle: values.subtitle,
        href: values.href,
        iconType: values.iconType,
        badge: values.badge ? values.badge : undefined,
        variant: values.variant,
      },
      initialLink?.id
    );
    onOpenChange(false);
  };

  const pickOptions = { shouldValidate: isSubmitted, shouldDirty: true };
  const pickIcon = (value: LinkFormValues["iconType"]) =>
    setValue("iconType", value, pickOptions);
  const pickBadge = (value: string) => setValue("badge", value, pickOptions);
  const pickVariant = (value: LinkFormValues["variant"]) =>
    setValue("variant", value, pickOptions);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} titleId="link-modal-title">
      <DialogHeader onClose={() => onOpenChange(false)}>
        <h2
          id="link-modal-title"
          className="text-base font-bold tracking-tight text-winter"
        >
          {isEditing ? "링크 정보 수정" : "새 링크 추가"}
        </h2>
        <p className="mt-0.5 text-xs text-winter/70">
          마이링크 카드에 표시할 채널 또는 포트폴리오 정보를 입력하세요.
        </p>
      </DialogHeader>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-3.5"
      >
        <div>
          <Label htmlFor="link-title" className="mb-1.5">
            링크 제목 *
          </Label>
          <Input
            id="link-title"
            placeholder="예: YouTube Channel, Coloso 강의 오픈"
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? "link-title-error" : undefined}
            {...register("title")}
          />
          <FieldError id="link-title-error" message={errors.title?.message} />
        </div>

        <div>
          <Label htmlFor="link-subtitle" className="mb-1.5">
            부제목 / 설명
          </Label>
          <Input
            id="link-subtitle"
            placeholder="예: 모션그래픽 개인작 & 작업 과정"
            aria-invalid={errors.subtitle ? true : undefined}
            {...register("subtitle")}
          />
          <FieldError message={errors.subtitle?.message} />
        </div>

        <div>
          <Label htmlFor="link-href" className="mb-1.5">
            이동 URL (또는 mailto:) *
          </Label>
          <Input
            id="link-href"
            inputMode="url"
            placeholder="https://... 또는 mailto:cleangabby@gmail.com"
            aria-invalid={errors.href ? true : undefined}
            aria-describedby={errors.href ? "link-href-error" : undefined}
            {...register("href")}
          />
          <FieldError id="link-href-error" message={errors.href?.message} />
        </div>

        {/* 아이콘 프리셋 선택 */}
        <div>
          <Label className="mb-1.5">아이콘 선택</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {LINK_ICON_OPTIONS.map((option) => {
              const selected = iconType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => pickIcon(option.value)}
                  className={`flex cursor-pointer items-center gap-2 rounded-[6px] border px-2.5 py-1.5 text-left text-xs transition-colors ${
                    selected
                      ? "border-hearth bg-hearth/25 font-semibold text-winter"
                      : "border-winter/15 bg-winter/8 text-winter/80 hover:bg-winter/15"
                  }`}
                >
                  <LinkIcon iconType={option.value} className="h-4 w-4 shrink-0" />
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 강조 배지 및 카드 스타일 */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <Label htmlFor="link-badge" className="mb-1.5">
              강조 배지 (선택)
            </Label>
            <Input
              id="link-badge"
              placeholder="예: NEW, FEATURED"
              aria-invalid={errors.badge ? true : undefined}
              {...register("badge")}
            />
            <FieldError message={errors.badge?.message} />
            <div className="mt-1.5 flex flex-wrap gap-1">
              {BADGE_PRESETS.map((preset) => (
                <button
                  key={preset || "none"}
                  type="button"
                  aria-pressed={badge === preset}
                  onClick={() => pickBadge(preset)}
                  className={`cursor-pointer rounded-[4px] border px-1.5 py-0.5 font-mono text-[10px] transition-colors ${
                    badge === preset
                      ? "border-hearth bg-hearth/30 text-winter"
                      : "border-winter/15 bg-winter/8 text-winter/70 hover:bg-winter/15"
                  }`}
                >
                  {preset || "없음"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-1.5">버튼 스타일 (Variant)</Label>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                aria-pressed={variant === "glass"}
                onClick={() => pickVariant("glass")}
                className={`flex cursor-pointer items-center justify-between rounded-[6px] border px-2.5 py-1.5 text-xs transition-colors ${
                  variant === "glass"
                    ? "border-hearth bg-winter/20 font-semibold text-winter"
                    : "border-winter/15 bg-winter/8 text-winter/75 hover:bg-winter/15"
                }`}
              >
                <span>Glass (반투명 유리)</span>
                {variant === "glass" && <Check className="h-3.5 w-3.5 text-hearth" />}
              </button>
              <button
                type="button"
                aria-pressed={variant === "primary"}
                onClick={() => pickVariant("primary")}
                className={`flex cursor-pointer items-center justify-between rounded-[6px] border px-2.5 py-1.5 text-xs transition-colors ${
                  variant === "primary"
                    ? "border-crow/20 bg-hearth font-semibold text-crow"
                    : "border-winter/15 bg-winter/8 text-winter/75 hover:bg-winter/15"
                }`}
              >
                <span>Primary (Hearth 강조)</span>
                {variant === "primary" && <Check className="h-3.5 w-3.5 text-crow" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-end gap-2 border-t border-winter/15 pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {isEditing ? (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>수정 저장</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>링크 추가</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
