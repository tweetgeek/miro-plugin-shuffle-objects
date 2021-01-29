const svgIcon = require('./random.svg');

function shuffleArray(array) {
  // eslint-disable-next-line no-plusplus
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // eslint-disable-next-line no-param-reassign
    [array[i], array[j]] = [array[j], array[i]];
  }
}

miro.onReady(() => {
  miro.initialize({
    extensionPoints: {
      bottomBar: {
        title: 'Shuffle selected items',
        svgIcon,
        onClick: async () => {
          const selectedItems = await miro.board.selection.get();
          if (!selectedItems.length) {
            // eslint-disable-next-line no-alert
            alert('Select items to shuffle!');
            return;
          }

          if (selectedItems.length <= 1) {
            // eslint-disable-next-line no-alert
            alert('Select more items to shuffle!');
            return;
          }

          const newItemsOrder = [...selectedItems];
          shuffleArray(newItemsOrder);

          // eslint-disable-next-line no-restricted-syntax
          for (const widget of selectedItems) {
            const index = selectedItems.indexOf(widget);
            const {
              bounds: { x, y },
            } = newItemsOrder[index];

            // eslint-disable-next-line no-await-in-loop
            await miro.board.widgets.create({ ...widget, x, y });

            // eslint-disable-next-line no-await-in-loop
            await miro.board.widgets.deleteById(widget.id);
          }
        },
      },
    },
  });
});
