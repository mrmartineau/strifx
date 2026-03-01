# strifx

> Like `clsx` for strings — conditionally compose any string, not just classNames.

[![npm](https://img.shields.io/npm/v/@mrmartineau/strifx)](https://www.npmjs.com/package/@mrmartineau/strifx)
[![size](https://img.shields.io/bundlephobia/minzip/@mrmartineau/strifx)](https://bundlephobia.com/package/@mrmartineau/strifx)

## The Problem

Building strings with conditional parts is ugly in JavaScript:

```ts
// Concatenation hell
const greeting = `Hello${name ? ` ${name}` : ''}${title ? `, ${title}` : ''}! Welcome to ${place}.`;

// Array filter hack
const address = [street, unit ? `Unit ${unit}` : '', `${city}, ${state} ${zip}`, country !== 'US' ? country : '']
  .filter(Boolean)
  .join('\n');
```

## The Solution

```ts
import { strifx, when } from '@mrmartineau/strifx';

const greeting = strifx`Hello${when(name, { prefix: ' ' })}${when(title, { prefix: ', ' })}! Welcome to ${place}.`;

const address = strifx.join('\n')(
  street,
  when(unit, { transform: v => `Unit ${v}` }),
  `${city}, ${state} ${zip}`,
  when(country, { test: v => v !== 'US' }),
);
```

## Install

```bash
npm install @mrmartineau/strifx
yarn add @mrmartineau/strifx
pnpm add @mrmartineau/strifx
bun add @mrmartineau/strifx
```

## API

### `strifx` — Tagged Template

```ts
import { strifx, when } from '@mrmartineau/strifx';

strifx`Hello ${when(name)} world`;
// name = "Zander" → "Hello Zander world"
// name = undefined → "Hello world"
```

Regular interpolation works as normal:

```ts
strifx`Order #${orderId} is ${status}`;
// → "Order #1234 is shipped"
```

### `when(value, options?)`

Marks a value as conditional. Returns a special marker the tagged template recognises.

```ts
when(value)                                    // include if non-nullish (0 and "" kept!)
when(value, { test: v => v > 0 })              // include if predicate passes
when(value, { test: isAdmin })                 // include if boolean gate is truthy
when(value, { prefix: ', ' })                  // prepend when included
when(value, { suffix: '!' })                   // append when included
when(value, { transform: v => v.toUpperCase() }) // transform before including
```

**Evaluation order:** nullish check → `false` check → `test` → `transform` → `prefix`/`suffix`

### `strifx.join(separator?)`

Join parts with an explicit separator. Nullish/false parts are excluded automatically.

```ts
strifx.join(', ')('apples', when(bananas), 'cherries');
// bananas = "bananas" → "apples, bananas, cherries"
// bananas = undefined → "apples, cherries"

strifx.join(' AND ')(
  `status = 'active'`,
  when(minAge, { transform: v => `age >= ${v}` }),
  when(region, { transform: v => `region = '${v}'` }),
);
// minAge = 21, region = "EU" → "status = 'active' AND age >= 21 AND region = 'EU'"
```

Pass an options object to use `Intl.ListFormat` for locale-aware conjunctions and disjunctions:

```ts
strifx.join({ locale: 'en', type: 'conjunction' })('apples', 'bananas', 'cherries');
// → "apples, bananas, and cherries"

strifx.join({ locale: 'en', type: 'disjunction' })('apples', 'bananas', 'cherries');
// → "apples, bananas, or cherries"

strifx.join({ locale: 'en', type: 'conjunction', style: 'narrow' })('apples', 'bananas', 'cherries');
// → "apples, bananas, cherries"

// Nullish/false parts are still filtered out
strifx.join({ locale: 'en', type: 'conjunction' })('apples', when(undefined), 'cherries');
// → "apples and cherries"
```

### Object Syntax

```ts
strifx({
  base: 'Dear ',
  name: user.name,
  greeting: [user.isNew, ', welcome!'],  // [condition, text]
  closing: '\nBest regards',
});
// user = { name: 'Zander', isNew: true } → "Dear Zander, welcome!\nBest regards"
// user = { name: 'Zander', isNew: false } → "Dear Zander!\nBest regards"
```

### Template Factory (`strifx/template`)

Create reusable templates with named placeholders:

```ts
import { template, when } from '@mrmartineau/strifx/template';

// Tagged template style
const greeting = template`Dear${when('title', { prefix: ' ' })}${when('name', { prefix: ' ' })}!`;
greeting({ title: 'Dr', name: 'Smith' }); // → "Dear Dr Smith!"
greeting({ name: 'Smith' });               // → "Dear Smith!"

// Function style (better TypeScript inference)
const greeting = template({
  keys: ['name', 'title'] as const,
  render: (v) => strifx`Dear${when(v.title, { prefix: ' ' })}${when(v.name, { prefix: ' ' })}.`,
});
```

### React (`strifx/react`)

```tsx
import { useStrifx, when } from '@mrmartineau/strifx/react';

function Greeting({ user }) {
  const title = useStrifx`Dear${when(user.title, { prefix: ' ' })}${when(user.name, { prefix: ' ' })}`;
  return <h1>{title}</h1>;
}
```

Conditional `ReactNode[]` with separators:

```tsx
import { strifxReact, when } from '@mrmartineau/strifx/react';

function StatusBar({ user, notifications }) {
  const parts = strifxReact(' · ')(
    when(user, { transform: u => <strong>{u.name}</strong> }),
    when(notifications, { transform: n => <Badge count={n} /> }),
  );
  return <nav>{parts}</nav>;
}
```

## Nullish vs Falsy

Unlike `clsx`, strifx uses **nullish** checking by default. `0` and `""` are valid string content and are kept.

| Value       | `when(value)` | Skipped? |
| ----------- | ------------- | -------- |
| `"hello"`   | ✅ included    |          |
| `0`         | ✅ included    |          |
| `""`        | ✅ included    |          |
| `false`     | ❌ skipped     | always   |
| `null`      | ❌ skipped     | always   |
| `undefined` | ❌ skipped     | always   |

## License

MIT
