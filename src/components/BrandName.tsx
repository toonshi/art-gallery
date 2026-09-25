import {Link} from '@astryxdesign/core/Link';
import {Text} from '@astryxdesign/core/Text';
import {site} from '@/lib/config';
import {brandFont} from '@/lib/fonts';

const sizes = {md: '3xl', lg: '4xl'} as const;

/** The shop name as a cursive wordmark. */
export function BrandName({href, size = 'md'}: {href?: string; size?: keyof typeof sizes}) {
  const wordmark = (
    <Text className={brandFont.className} size={sizes[size]} weight="normal">
      {site.name}
    </Text>
  );
  return href ? (
    <Link href={href} label={`${site.name} home`}>
      {wordmark}
    </Link>
  ) : (
    wordmark
  );
}
