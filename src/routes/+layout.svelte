<script lang="ts">
	import { useGeographic } from 'ol/proj';

	useGeographic();
</script>

<main>
	<slot></slot>
</main>
