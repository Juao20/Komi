import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'

import type { ProductImageDraft } from '@/features/products/components/ImageUploader'
import { ImageUploader } from '@/features/products/components/ImageUploader'
import { useCategories, useCreateProduct, useProduct, useUpdateProduct } from '@/features/products/hooks'
import { useMyStore } from '@/features/store/hooks'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Switch } from '@/shared/components/ui/switch'
import { Textarea } from '@/shared/components/ui/textarea'

const emptyToUndefined = (val: unknown) => (val === '' || val === undefined || val === null ? undefined : val)

const optionalPrice = z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional())
const requiredPrice = (message: string) =>
  z.preprocess(emptyToUndefined, z.coerce.number({ error: message }).min(0, 'Le prix doit être positif.'))

const variantSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  sku: z.string().optional(),
  price: optionalPrice,
  stock: z.coerce.number().min(0).default(0),
})

const schema = z.object({
  name: z.string().min(2, 'Le nom est requis.'),
  category: z.string().optional(),
  description: z.string().optional(),
  price: requiredPrice('Prix requis.'),
  compare_at_price: optionalPrice,
  sku: z.string().optional(),
  stock: z.coerce.number().min(0).default(0),
  track_inventory: z.boolean().default(true),
  status: z.enum(['draft', 'active', 'archived']).default('active'),
  variants: z.array(variantSchema).default([]),
})

type FormInput = z.input<typeof schema>
type FormValues = z.output<typeof schema>

const STATUS_LABELS: Record<FormValues['status'], string> = {
  active: 'Active — visible sur la boutique',
  draft: 'Brouillon — masquée',
  archived: 'Archivée',
}

export function ProductFormPage() {
  const { productId } = useParams<{ productId: string }>()
  const isEditing = Boolean(productId)
  const navigate = useNavigate()

  const { data: store } = useMyStore()
  const { data: categories } = useCategories()
  const { data: product, isPending: isProductPending } = useProduct(productId)
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct(productId ?? '')

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active', track_inventory: true, stock: 0, variants: [], category: '' },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' })
  const [images, setImages] = useState<ProductImageDraft[]>([])

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        category: product.category?.public_id ?? '',
        description: product.description,
        price: Number(product.price),
        compare_at_price: product.compare_at_price ? Number(product.compare_at_price) : undefined,
        sku: product.sku,
        stock: product.stock,
        track_inventory: product.track_inventory,
        status: product.status,
        variants: product.variants.map((v) => ({
          name: v.name,
          sku: v.sku,
          price: v.price ? Number(v.price) : undefined,
          stock: v.stock,
        })),
      })
      setImages(product.images.map((img) => ({ image_url: img.image_url, alt_text: img.alt_text, is_primary: img.is_primary })))
    }
  }, [product, reset])

  const isSaving = createProduct.isPending || updateProduct.isPending

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      category: values.category || null,
      compare_at_price: values.compare_at_price ?? null,
      variants: values.variants
        .filter((variant) => variant.name)
        .map((variant) => ({ ...variant, price: variant.price ?? null })),
      images,
    }

    if (isEditing && productId) {
      updateProduct.mutate(payload, { onSuccess: () => navigate('/dashboard/products') })
    } else {
      createProduct.mutate(payload, { onSuccess: () => navigate('/dashboard/products') })
    }
  }

  if (isEditing && isProductPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="icon" asChild>
          <Link to="/dashboard/products">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isEditing ? 'Modifier le produit' : 'Ajouter un produit'}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nom du produit</Label>
                <Input id="name" placeholder="Robe Wax Élégante" {...register('name')} aria-invalid={Boolean(errors.name)} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={4} placeholder="Décrivez votre produit…" {...register('description')} />
              </div>

              <div className="space-y-1.5">
                <Label>Catégorie</Label>
                <Select value={watch('category')} onValueChange={(value) => value && setValue('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Aucune catégorie">
                      {categories?.find((c) => c.public_id === watch('category'))?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.public_id} value={category.public_id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploader images={images} onChange={setImages} folder={store ? `komi/stores/${store.slug}/products` : undefined} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Variantes (optionnel)</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', sku: '', price: '', stock: 0 })}>
                <Plus />
                Ajouter
              </Button>
            </CardHeader>
            {fields.length > 0 && (
              <CardContent className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-2">
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-xs">Nom</Label>
                      <Input placeholder="Rouge / M" {...register(`variants.${index}.name`)} />
                    </div>
                    <div className="w-28 space-y-1.5">
                      <Label className="text-xs">Prix</Label>
                      <Input type="number" placeholder={String(watch('price') ?? '')} {...register(`variants.${index}.price`)} />
                    </div>
                    <div className="w-24 space-y-1.5">
                      <Label className="text-xs">Stock</Label>
                      <Input type="number" {...register(`variants.${index}.stock`)} />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prix &amp; stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="price">Prix de vente ({store?.currency})</Label>
                <Input id="price" type="number" step="0.01" {...register('price')} aria-invalid={Boolean(errors.price)} />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="compare_at_price">Prix barré (optionnel)</Label>
                <Input id="compare_at_price" type="number" step="0.01" {...register('compare_at_price')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sku">SKU (optionnel)</Label>
                <Input id="sku" {...register('sku')} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Suivre le stock</p>
                  <p className="text-xs text-muted-foreground">Décompte automatique à chaque commande</p>
                </div>
                <Switch checked={watch('track_inventory')} onCheckedChange={(checked) => setValue('track_inventory', checked)} />
              </div>
              {watch('track_inventory') && fields.length === 0 && (
                <div className="space-y-1.5">
                  <Label htmlFor="stock">Quantité en stock</Label>
                  <Input id="stock" type="number" {...register('stock')} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visibilité</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={watch('status')}
                onValueChange={(value) => value && setValue('status', value as FormValues['status'])}
              >
                <SelectTrigger>
                  <SelectValue>{STATUS_LABELS[watch('status') ?? 'active']}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active — visible sur la boutique</SelectItem>
                  <SelectItem value="draft">Brouillon — masquée</SelectItem>
                  <SelectItem value="archived">Archivée</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm sm:pl-72">
        <div className="mx-auto flex max-w-7xl justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/dashboard/products')}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="animate-spin" />}
            {isEditing ? 'Enregistrer' : 'Créer le produit'}
          </Button>
        </div>
      </div>
    </form>
  )
}
