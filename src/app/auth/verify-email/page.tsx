import { redirect } from 'next/navigation';

type VerifyEmailAliasPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VerifyEmailAliasPage({ searchParams }: VerifyEmailAliasPageProps) {
  const resolvedSearchParams = (await searchParams) || {};
  const nextSearchParams = new URLSearchParams();

  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item) {
          nextSearchParams.append(key, item);
        }
      });
      return;
    }

    if (value) {
      nextSearchParams.set(key, value);
    }
  });

  const query = nextSearchParams.toString();
  redirect(query ? `/verify-email?${query}` : '/verify-email');
}
