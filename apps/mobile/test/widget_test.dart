import "package:flutter_test/flutter_test.dart";

import "package:aria_mobile/main.dart";

void main() {
  testWidgets("chat home renders", (WidgetTester tester) async {
    await tester.pumpWidget(const AriaApp());
    await tester.pumpAndSettle();

    expect(find.text("首页"), findsOneWidget);
    expect(find.text("我的"), findsOneWidget);
    expect(find.text("语音电话"), findsNothing);
  });
}
