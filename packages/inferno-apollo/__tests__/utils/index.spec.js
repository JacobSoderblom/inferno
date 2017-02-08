import getDisplayName from './getDisplayName.spec';
import shallowEqual from './shallowEqual.spec';
import switchCase from './switchCase.spec';

export default function utils() {
	describe('Utils', () => {
		getDisplayName();
		shallowEqual();
		switchCase();
	});
}
