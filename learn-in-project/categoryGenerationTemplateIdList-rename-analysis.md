# categoryGenerationTemplateIdList → categoryGenerationTemplateList 改名分析

## 变更概述

- **字段改名**: `categoryGenerationTemplateIdList` → `categoryGenerationTemplateList`
- **类型变更**: `string[]`（categoryId 数组） → `{ categoryCode: string, categoryId: string }[]`（对象数组）

---

## 涉及需要修改的代码清单，使用代码块展示其修改，并在底部标出涉及文件

### 1. AddCategory 组件：value 改为对象数组，去除 categoryMap

Props 类型改为对象数组，CategoryTags 直接使用对象属性渲染（删除 `categoryMap` 和 `api.category.list.useQuery`），CategoryEditor 适配新类型。

```diff
+ type CategoryItem = { categoryCode: string; categoryId: string }

  interface AddCategoryProps {
-   value?: string[]
+   value?: CategoryItem[]
    placeholder?: string
    disabled?: boolean
    className?: string
    templateId: string
    onSuccess?: () => void
    mode?: 'table' | 'edit'
  }

- const EMPTY_VALUE: string[] = []
+ const EMPTY_VALUE: CategoryItem[] = []
```

```diff
- const CategoryTags = (props: { value: string[] }) => {
+ const CategoryTags = (props: { value: CategoryItem[] }) => {
    const { value } = props

-   const { data } = api.category.list.useQuery({
-     page: 1,
-     pageSize: CATEGORY_QUERY_PAGE_SIZE,
-   })
-
-   const categoryMap = useMemo(() => {
-     const map = new Map<string, string>()
-     data?.list?.forEach((item) => {
-       map.set(item.categoryId, item.categoryCode)
-     })
-     return map
-   }, [data?.list])

    if (value.length === 0) {
      return <span className='text-f-text-tertiary'>-</span>
    }

    return (
      <div className='flex flex-wrap gap-1'>
-       {value.map((id) => (
-         <Tag key={id} color='blue'>
-           {categoryMap.get(id) || id}
+       {value.map((item) => (
+         <Tag key={item.categoryId} color='blue'>
+           {item.categoryCode}
          </Tag>
        ))}
      </div>
    )
  }
```

```diff
  const CategoryEditor = (props: Omit<AddCategoryProps, 'mode'>) => {
    const {
      value = EMPTY_VALUE,
      ...
    } = props

-   const [selectedCategories, setSelectedCategories] = useState<string[]>(value)
+   const [selectedCategories, setSelectedCategories] = useState<string[]>(
+     value.map((item) => item.categoryId),
+   )

    useEffect(() => {
-     setSelectedCategories(value)
+     setSelectedCategories(value.map((item) => item.categoryId))
    }, [value])

+   const valueIds = useMemo(() => value.map((item) => item.categoryId), [value])

    const handleSubmit = useMemoizedFn(async () => {
      const addedCategories = selectedCategories.filter(
-       (id) => !value.includes(id),
+       (id) => !valueIds.includes(id),
      )
      const removedCategories = value.filter(
-       (id) => !selectedCategories.includes(id),
+       (item) => !selectedCategories.includes(item.categoryId),
-     )
+     ).map((item) => item.categoryId)
      ...
    })

    const hasChanges = useMemo(() => {
-     if (selectedCategories.length !== value.length) return true
-     const sortedSelected = [...selectedCategories].sort()
-     const sortedValue = [...value].sort()
-     return sortedSelected.some((id, index) => id !== sortedValue[index])
-   }, [selectedCategories, value])
+     if (selectedCategories.length !== valueIds.length) return true
+     const sortedSelected = [...selectedCategories].sort()
+     const sortedValue = [...valueIds].sort()
+     return sortedSelected.some((id, index) => id !== sortedValue[index])
+   }, [selectedCategories, valueIds])
  }
```

> `web/src/_blocks/Managements/_components/AddCategory/index.tsx`

---

### 2. Templates 列表页：字段名更新

```diff
  {
    title: 'Categories',
-   dataIndex: 'categoryGenerationTemplateIdList',
-   key: 'categoryGenerationTemplateIdList',
+   dataIndex: 'categoryGenerationTemplateList',
+   key: 'categoryGenerationTemplateList',
    hideInSearch: true,
    width: 190,
    render: (_, record) => {
      return (
        <AddCategory
          mode='table'
-         value={record.categoryGenerationTemplateIdList}
+         value={record.categoryGenerationTemplateList}
          templateId={record.id || ''}
        />
      )
    },
  },
```

> `web/src/_blocks/Managements/Templates/index.tsx`

---

### 3. Templates AddModal：Form.Item name 更新

```diff
- <Form.Item label='Categories' name='categoryGenerationTemplateIdList'>
+ <Form.Item label='Categories' name='categoryGenerationTemplateList'>
    <AddCategory templateId={editItem?.id || ''} />
  </Form.Item>
```

> `web/src/_blocks/Managements/Templates/AddModal/index.tsx`

---

### 4. PGC 模板页：字段名更新

表格列：

```diff
  {
    title: '已关联的分类',
-   dataIndex: 'categoryGenerationTemplateIdList',
-   key: 'categoryGenerationTemplateIdList',
+   dataIndex: 'categoryGenerationTemplateList',
+   key: 'categoryGenerationTemplateList',
    hideInSearch: true,
    width: 150,
    render: (_, record) => {
      return (
        <AddCategory
          mode='table'
-         value={record.categoryGenerationTemplateIdList}
+         value={record.categoryGenerationTemplateList}
          templateId={record.id || ''}
        />
      )
    },
  },
```

Form.Item：

```diff
  <Form.Item
    label={'Categories'}
-   name='categoryGenerationTemplateIdList'
+   name='categoryGenerationTemplateList'
  >
    <AddCategory
      templateId={templateItem?.id || ''}
      onSuccess={() => {
        actionRef.current?.reload()
      }}
    />
  </Form.Item>
```

> `web/src/_blocks/Managements/PGC/_components/PGCTemplate.tsx`

---

## 涉及文件汇总

- `web/src/_blocks/Managements/_components/AddCategory/index.tsx`
- `web/src/_blocks/Managements/Templates/index.tsx`
- `web/src/_blocks/Managements/Templates/AddModal/index.tsx`
- `web/src/_blocks/Managements/PGC/_components/PGCTemplate.tsx`
