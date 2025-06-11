"use client";
import { useParams } from "next/navigation";

export default function GeneralSettingsPage() {
  const params = useParams();
  const { slug } = params;

  return (
    <div>
      <h4>GeneralSettings: {slug}</h4>
    </div>
  );
}
