"use client";

import { useState, type FormEvent } from "react";
import { Check, Plus, Save } from "lucide-react";
import {
  LINK_ICON_OPTIONS,
  type LinkIconType,
  type LinkItem,
} from "@/data/links";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader } from "@/components/ui/dialog";
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
  const [title, setTitle] = useState(initialLink?.title ?? "");
  const [subtitle, setSubtitle] = useState(initialLink?.subtitle ?? "");
  const [href, setHref] = useState(initialLink?.href ?? "https://");
  const [iconType, setIconType] = useState<LinkIconType>(
    initialLink?.iconType ?? "link"
  );
  const [badge, setBadge] = useState(initialLink?.badge ?? "");
  const [variant, setVariant] = useState<"primary" | "glass">(
    initialLink?.variant ?? "glass"
  );
  const [error, setError] = useState("");

  const isEditing = Boolean(initialLink);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedHref = href.trim();

    if (!trimmedTitle) {
      setError("링크 제목을 입력해주세요.");
      return;
    }
    if (!trimmedHref) {
      setError("이동할 URL 또는 mailto: 주소를 입력해주세요.");
      return;
    }

    setError("");
    onSave(
      {
        title: trimmedTitle,
        subtitle: subtitle.trim(),
        href: trimmedHref,
        iconType,
        badge: badge.trim() ? badge.trim() : undefined,
        variant,
      },
      initialLink?.id
    );
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      titleId="link-modal-title"
    >
      <DialogHeader onClose={() => onOpenChange(false)}>
        <h2
          id="link-modal-title"
          className="text-base font-bold tracking-tight text-white"
        >
          {isEditing ? "링크 정보 수정" : "새 링크 추가"}
        </h2>
        <p className="mt-0.5 text-xs text-white/70">
          마이링크 카드에 표시할 채널 또는 포트폴리오 정보를 입력하세요.
        </p>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div>
          <Label htmlFor="link-title" className="mb-1.5">
            링크 제목 *
          </Label>
          <Input
            id="link-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: YouTube Channel, Coloso 강의 오픈"
            required
          />
        </div>

        <div>
          <Label htmlFor="link-subtitle" className="mb-1.5">
            부제목 / 설명
          </Label>
          <Input
            id="link-subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="예: 모션그래픽 개인작 & 작업 과정"
          />
        </div>

        <div>
          <Label htmlFor="link-href" className="mb-1.5">
            이동 URL (또는 mailto:) *
          </Label>
          <Input
            id="link-href"
            value={href}
            onChange={(e) => setHref(e.target.value)}
            placeholder="https://... 또는 mailto:cleangabby@gmail.com"
            required
          />
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
                  onClick={() => setIconType(option.value)}
                  className={`flex cursor-pointer items-center gap-2 rounded-[6px] border px-2.5 py-1.5 text-left text-xs transition-colors ${
                    selected
                      ? "border-[#0080FF] bg-[#0080FF]/25 font-semibold text-white"
                      : "border-white/15 bg-white/8 text-white/80 hover:bg-white/15"
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
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="예: NEW, FEATURED"
            />
            <div className="mt-1.5 flex flex-wrap gap-1">
              {BADGE_PRESETS.map((preset) => (
                <button
                  key={preset || "none"}
                  type="button"
                  onClick={() => setBadge(preset)}
                  className={`cursor-pointer rounded-[4px] border px-1.5 py-0.5 font-mono text-[10px] transition-colors ${
                    badge === preset
                      ? "border-[#0080FF] bg-[#0080FF]/30 text-white"
                      : "border-white/15 bg-white/8 text-white/70 hover:bg-white/15"
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
                onClick={() => setVariant("glass")}
                className={`flex cursor-pointer items-center justify-between rounded-[6px] border px-2.5 py-1.5 text-xs transition-colors ${
                  variant === "glass"
                    ? "border-[#0080FF] bg-white/20 font-semibold text-white"
                    : "border-white/15 bg-white/8 text-white/75 hover:bg-white/15"
                }`}
              >
                <span>Glass (반투명 유리)</span>
                {variant === "glass" && <Check className="h-3.5 w-3.5 text-[#0080FF]" />}
              </button>
              <button
                type="button"
                onClick={() => setVariant("primary")}
                className={`flex cursor-pointer items-center justify-between rounded-[6px] border px-2.5 py-1.5 text-xs transition-colors ${
                  variant === "primary"
                    ? "border-white/40 bg-[#0080FF] font-semibold text-white"
                    : "border-white/15 bg-white/8 text-white/75 hover:bg-white/15"
                }`}
              >
                <span>Primary (일렉트릭 블루)</span>
                {variant === "primary" && <Check className="h-3.5 w-3.5 text-white" />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-xs font-medium text-[#FF1493]">
            {error}
          </p>
        )}

        <div className="mt-2 flex items-center justify-end gap-2 border-t border-white/15 pt-3">
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
