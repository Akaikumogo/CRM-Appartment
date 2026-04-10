import { Phone } from 'lucide-react';
import { getSupportPhoneFromSession } from '@/lib/sessionUser';

export function OrganizationBlockedScreen() {
  const phone = getSupportPhoneFromSession();

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-slate-950 px-6 text-center text-white">
      <h1 className="max-w-lg text-xl font-semibold leading-relaxed sm:text-2xl">
        Saytdan foydalanish huquqingiz tugatilgan. Qo‘llab-quvvatlash bilan
        bog‘laning.
      </h1>
      {phone ? (
        <a
          href={`tel:${phone.replace(/\s/g, '')}`}
          className="flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-lg font-medium hover:bg-white/20"
        >
          <Phone size={22} />
          {phone}
        </a>
      ) : (
        <p className="text-slate-400">
          Aloqa uchun administrator bilan bog‘laning.
        </p>
      )}
    </div>
  );
}
