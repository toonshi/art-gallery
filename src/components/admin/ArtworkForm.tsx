'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Layout, LayoutContent, LayoutFooter, HStack, VStack} from '@astryxdesign/core/Layout';
import {Grid} from '@astryxdesign/core/Grid';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Banner} from '@astryxdesign/core/Banner';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {TextInput} from '@astryxdesign/core/TextInput';
import {TextArea} from '@astryxdesign/core/TextArea';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {Selector} from '@astryxdesign/core/Selector';
import {Switch} from '@astryxdesign/core/Switch';
import {FileInput} from '@astryxdesign/core/FileInput';
import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Link} from '@astryxdesign/core/Link';
import {useToast} from '@astryxdesign/core/Toast';
import {deleteArtwork, saveArtwork, type ArtworkInput} from '@/lib/admin/actions';
import {slugify} from '@/lib/format';
import {imageUrl} from '@/lib/images';
import {createSupabaseBrowserClient} from '@/lib/supabase/browser';
import type {Artwork} from '@/lib/types';
import {PageHeader} from './PageHeader';

const MAX_EDGE = 2400;

/** Shrinks large phone photos before upload; keeps quality for the web. */
async function prepareImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1_500_000) return file;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Could not process image'))), 'image/jpeg', 0.88),
  );
}

function emptyInput(): ArtworkInput {
  return {
    title: '',
    slug: '',
    description: '',
    medium: '',
    dimensions: '',
    year: new Date().getFullYear(),
    price_kes: 0,
    status: 'available',
    is_published: true,
    is_featured: false,
    images: [],
  };
}

export function ArtworkForm({artwork, isDemo}: {artwork?: Artwork; isDemo: boolean}) {
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState<ArtworkInput>(() =>
    artwork
      ? {
          id: artwork.id,
          title: artwork.title,
          slug: artwork.slug,
          description: artwork.description,
          medium: artwork.medium,
          dimensions: artwork.dimensions,
          year: artwork.year,
          price_kes: artwork.price_kes,
          status: artwork.status,
          is_published: artwork.is_published,
          is_featured: artwork.is_featured,
          images: artwork.images,
        }
      : emptyInput(),
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(artwork));
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const set = <K extends keyof ArtworkInput>(key: K, value: ArtworkInput[K]) =>
    setValues(v => ({...v, [key]: value}));

  async function upload(files: File | File[] | null) {
    const list = Array.isArray(files) ? files : files ? [files] : [];
    if (!list.length) return;
    if (isDemo) {
      setError('Demo mode: connect Supabase to upload photos.');
      return;
    }
    const supabase = createSupabaseBrowserClient();
    setUploading(n => n + list.length);
    for (const file of list) {
      try {
        const blob = await prepareImage(file);
        const ext = blob.type === 'image/jpeg' ? 'jpg' : (file.name.split('.').pop() ?? 'jpg');
        const path = `${crypto.randomUUID()}.${ext.toLowerCase()}`;
        const {error: uploadError} = await supabase.storage
          .from('artworks')
          .upload(path, blob, {contentType: blob.type || file.type, cacheControl: '31536000'});
        if (uploadError) throw uploadError;
        setValues(v => ({...v, images: [...v.images, path]}));
      } catch (e) {
        toast({body: `Couldn't upload ${file.name}: ${(e as Error).message}`, type: 'error'});
      } finally {
        setUploading(n => n - 1);
      }
    }
  }

  function makeCover(index: number) {
    setValues(v => {
      const images = [...v.images];
      const [picked] = images.splice(index, 1);
      return {...v, images: [picked, ...images]};
    });
  }

  async function save() {
    setError(null);
    const result = await saveArtwork({...values, slug: slugTouched ? values.slug : undefined});
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast({body: artwork ? 'Changes saved' : 'Artwork added'});
    router.push('/admin/artworks');
    router.refresh();
  }

  async function remove() {
    if (!artwork) return;
    setIsDeleting(true);
    const result = await deleteArtwork(artwork.id);
    setIsDeleting(false);
    if (!result.ok) {
      setIsDeleteOpen(false);
      setError(result.error);
      return;
    }
    toast({body: `Deleted “${artwork.title}”`});
    router.push('/admin/artworks');
    router.refresh();
  }

  const shopUrl = `/artworks/${values.slug || slugify(values.title)}`;

  return (
    <Layout
      contentWidth={960}
      content={
        <LayoutContent padding={6}>
          <VStack gap={6}>
            <PageHeader
              eyebrow={<Link href="/admin/artworks">← Artworks</Link>}
              title={artwork ? artwork.title : 'Add artwork'}
              description={
                artwork?.is_published ? (
                  <Link href={shopUrl} target="_blank">
                    View in shop
                  </Link>
                ) : undefined
              }
            />
            {error ? <Banner status="error" title={error} /> : null}

            <VStack gap={3}>
                <Heading level={2}>Photos</Heading>
                <Text color="secondary">
                  The first photo is the cover. Add close-ups or the piece in a room to help buyers
                  judge scale.
                </Text>
                {values.images.length ? (
                  <HStack gap={3} wrap="wrap">
                    {values.images.map((path, i) => (
                      <VStack key={path} gap={1} hAlign="center">
                        <Thumbnail
                          src={imageUrl(path) ?? undefined}
                          alt={`Photo ${i + 1}`}
                          label={i === 0 ? 'Cover photo' : 'Make cover'}
                          onClick={i === 0 ? undefined : () => makeCover(i)}
                          onRemove={() => set('images', values.images.filter(p => p !== path))}
                        />
                        <Text type="supporting">{i === 0 ? 'Cover' : `#${i + 1}`}</Text>
                      </VStack>
                    ))}
                  </HStack>
                ) : null}
                <FileInput
                  label="Add photos"
                  isLabelHidden
                  mode="dropzone"
                  accept="image/jpeg,image/png,image/webp"
                  isMultiple
                  value={[]}
                  onChange={() => {}}
                  changeAction={upload}
                  isLoading={uploading > 0}
                  placeholder="Drop photos here or click to choose"
                  description="JPEG, PNG or WebP. Large photos are resized automatically."
                />
            </VStack>

            <VStack gap={3}>
                <Heading level={2}>Details</Heading>
                <FormLayout defaultOptionality="optional">
                  <TextInput
                    label="Title"
                    isRequired
                    value={values.title}
                    onChange={title =>
                      setValues(v => ({...v, title, slug: slugTouched ? v.slug : slugify(title)}))
                    }
                  />
                  <TextArea
                    label="Description"
                    description="The story of the piece, materials, framing, how it's signed."
                    rows={6}
                    maxLength={5000}
                    value={values.description}
                    onChange={description => set('description', description)}
                  />
                  <Grid columns={{minWidth: 220, repeat: 'fit'}} gap={4}>
                    <TextInput
                      label="Medium"
                      placeholder="Acrylic on canvas"
                      value={values.medium}
                      onChange={medium => set('medium', medium)}
                    />
                    <TextInput
                      label="Size"
                      placeholder="60 × 80 cm"
                      value={values.dimensions}
                      onChange={dimensions => set('dimensions', dimensions)}
                    />
                    <NumberInput
                      label="Year"
                      isIntegerOnly
                      min={1900}
                      max={2100}
                      hasClear
                      value={values.year}
                      onChange={(year: number | null) => set('year', year)}
                    />
                  </Grid>
                  <TextInput
                    label="Web address"
                    description={`Shown as ${shopUrl}`}
                    value={values.slug ?? ''}
                    onChange={slug => {
                      setSlugTouched(true);
                      set('slug', slugify(slug));
                    }}
                  />
                </FormLayout>
            </VStack>

            <VStack gap={3}>
                <Heading level={2}>Price and availability</Heading>
                <FormLayout defaultOptionality="optional">
                  <Grid columns={{minWidth: 220, repeat: 'fit'}} gap={4}>
                    <NumberInput
                      label="Price"
                      isRequired
                      isIntegerOnly
                      min={1}
                      units="KES"
                      formatValue={n => n.toLocaleString('en-KE')}
                      value={values.price_kes || null}
                      onChange={price => set('price_kes', price)}
                    />
                    <Selector
                      label="Status"
                      value={values.status}
                      onChange={status => set('status', status as ArtworkInput['status'])}
                      options={[
                        {value: 'available', label: 'Available', description: 'Can be bought online'},
                        {value: 'reserved', label: 'Reserved', description: 'On hold; not buyable'},
                        {value: 'sold', label: 'Sold', description: 'Shown as sold in the shop'},
                      ]}
                    />
                  </Grid>
                  <Switch
                    label="Listed in the shop"
                    description="Hidden pieces are only visible here in the admin."
                    labelSpacing="spread"
                    width="100%"
                    value={values.is_published}
                    onChange={v => set('is_published', v)}
                  />
                  <Switch
                    label="Featured on the home page"
                    labelSpacing="spread"
                    width="100%"
                    value={values.is_featured}
                    onChange={v => set('is_featured', v)}
                  />
                </FormLayout>
            </VStack>
          </VStack>
        </LayoutContent>
      }
      footer={
        <LayoutFooter hasDivider padding={6}>
          <HStack gap={2} justify="between">
            {artwork ? (
              <Button label="Delete" variant="destructive" onClick={() => setIsDeleteOpen(true)} />
            ) : (
              <Button label="Cancel" variant="ghost" href="/admin/artworks" />
            )}
            <Button
              label={artwork ? 'Save changes' : 'Add artwork'}
              variant="primary"
              isDisabled={uploading > 0}
              clickAction={save}
            />
          </HStack>
          {artwork ? (
            <AlertDialog
              isOpen={isDeleteOpen}
              onOpenChange={setIsDeleteOpen}
              title={`Delete “${artwork.title}”?`}
              description="It will be removed from the shop and its photos deleted. Past orders keep their record. Consider hiding it instead."
              actionLabel="Delete artwork"
              onAction={remove}
              isActionLoading={isDeleting}
            />
          ) : null}
        </LayoutFooter>
      }
    />
  );
}
