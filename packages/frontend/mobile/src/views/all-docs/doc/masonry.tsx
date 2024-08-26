import type { DocMeta } from '@blocksuite/store';
import { useCallback, useEffect, useRef, useState } from 'react';

import { DocCard } from '../../../components';
import * as styles from './masonry.css';

// TODO(@CatsJuice): Large amount docs performance
export const MasonryDocs = ({
  items,
  showTags,
}: {
  items: DocMeta[];
  showTags?: boolean;
}) => {
  const invisibleStackRef = useRef<HTMLUListElement>(null);
  const [stacks, setStacks] = useState<DocMeta[][]>([[], []]);

  const calcStacks = useCallback(() => {
    const ul = invisibleStackRef.current;
    if (!ul) return;

    const newStacks: [DocMeta[], DocMeta[]] = [[], []];
    const stackSizeMap = [0, 0];

    const cards = Array.from(ul.children) as HTMLAnchorElement[];
    cards.forEach((card, i) => {
      card.style.setProperty('display', 'block');
      const cardHeight = card.offsetHeight;
      card.style.setProperty('display', 'none');

      const stackIndex = stackSizeMap[0] <= stackSizeMap[1] ? 0 : 1;
      const item = items[i];
      if (!item) return;

      newStacks[stackIndex].push(item);
      stackSizeMap[stackIndex] += cardHeight;
    });

    setStacks(newStacks);
  }, [items]);

  useEffect(() => {
    calcStacks();
  }, [calcStacks]);

  return (
    <div className={styles.stacks}>
      <div className={styles.invisibleWrapper}>
        <ul className={styles.invisibleList} ref={invisibleStackRef}>
          {items.map(item => (
            <DocCard showTags={showTags} key={item.id} meta={item} />
          ))}
        </ul>
      </div>

      {stacks.map((stack, i) => (
        <ul key={i} className={styles.stack}>
          {stack.map(item => (
            <DocCard showTags={showTags} key={item.id} meta={item} />
          ))}
        </ul>
      ))}
    </div>
  );
};
