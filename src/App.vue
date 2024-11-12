<script setup lang="ts">
import { Item } from '@mirohq/websdk-types/stable/api/client';
import { shuffleFisherYates } from './utils/shuffle';

const areTheElementsOfTheSameType = (items: Item[]): boolean =>
    items.map(({ type }) => type).filter((v, i, a) => a.indexOf(v) === i).length === 1;

async function shuffle(throwError = false) {
  const selectedItems = await miro.board.getSelection();
  if (!selectedItems.length) {
    await miro.board.notifications.showError('🚨 First, choose what to shuffle! 😂');
    return;
  }

  if (selectedItems.length <= 1) {
    await miro.board.notifications.showError('🚨 There is nothing to shuffle.');
    return;
  }

  if (!areTheElementsOfTheSameType(selectedItems)) {
    await miro.board.notifications.showError('🚨 The elements to be shuffled should be of the same type. 👮🏻‍️');
    return;
  }
  const items = selectedItems.map((item) => ({
    id: item.id,
    x: item.x,
    y: item.y,
  }));
  const shuffledItems = shuffleFisherYates([...items]);

  if (items.map(({ id }) => id).join(',') === shuffledItems.map(({ id }) => id).join(',')) {
    if (throwError) {
      await miro.board.notifications.showError('🚨 Problem with shuffling. Please try again. 😅');
      return;
    }

    await shuffle(true);
    return;
  }

  await Promise.all(
      items.map((item, index) => {
        return miro.board.getById(item.id).then((i) => {
          i.x = shuffledItems[index].x;
          i.y = shuffledItems[index].y;

          return i.sync();
        });
      }),
  );
  await miro.board.notifications.showInfo('I made a mess. 😎');
}
</script>

<template>
  <div id="root">
    <div class="wrapper">
      <div class="cs1">
        <a
            class="button button-primary"
            @click="shuffle"
        >
          Shuffle!
        </a>
      </div>
    </div>
  </div>
</template>

<style>
</style>
