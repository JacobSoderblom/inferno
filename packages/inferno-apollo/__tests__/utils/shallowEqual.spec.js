// https://github.com/reactjs/react-redux/blob/master/test/utils/shallowEqual.spec.js
import { expect } from 'chai';

import shallowEqual from '../../dist-es/utils/shallowEqual';

export default function () {
	describe('ShallowEqual', () => {
		it('should return true if input is the same', () => {
			expect(shallowEqual('foo', 'foo')).to.equal(true);
		});

		it('should return true if arguments fields are equal', () => {
			expect(
				shallowEqual(
					{ a: 1, b: 2, c: undefined },
					{ a: 1, b: 2, c: undefined }
				)
			).to.equal(true);

			expect(
				shallowEqual(
					{ a: 1, b: 2, c: 3 },
					{ a: 1, b: 2, c: 3 }
				)
			).to.equal(true);

			const o = {};
			expect(
				shallowEqual(
					{ a: 1, b: 2, c: o },
					{ a: 1, b: 2, c: o }
				)
			).to.equal(true);

			const d = () => 1;
			expect(
				shallowEqual(
					{ a: 1, b: 2, c: o, d },
					{ a: 1, b: 2, c: o, d }
				)
			).to.equal(true);
		});

		it('should return false if arguments fields are different function identities', () => {
			expect(
				shallowEqual(
					{ a: 1, b: 2, d: () => 1 },
					{ a: 1, b: 2, d: () => 1 }
				)
			).to.equal(false);
		});

		it('should return false if first argument has too many keys', () => {
			expect(
				shallowEqual(
					{ a: 1, b: 2, c: 3 },
					{ a: 1, b: 2 }
				)
			).to.equal(false);
		});

		it('should return false if second argument has too many keys', () => {
			expect(
				shallowEqual(
					{ a: 1, b: 2 },
					{ a: 1, b: 2, c: 3 }
				)
			).to.equal(false);
		});

		it('should return false if arguments have different keys', () => {
			expect(
				shallowEqual(
					{ a: 1, b: 2, c: undefined },
					{ a: 1, bb: 2, c: undefined }
				)
			).to.equal(false);
		});
	});
}
