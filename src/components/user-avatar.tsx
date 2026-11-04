/** 프로필 사진 (없거나 못 불러오면 이름 첫 글자) */
export function UserAvatar({
  name,
  photoURL,
  size = 28,
}: {
  name: string;
  photoURL: string;
  size?: number;
}) {
  const initial = name.trim().slice(0, 1).toUpperCase() || "?";
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-winter/25 bg-cedar font-bold text-winter"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      <span aria-hidden="true">{initial}</span>
      {photoURL && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoURL}
          alt=""
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </span>
  );
}
