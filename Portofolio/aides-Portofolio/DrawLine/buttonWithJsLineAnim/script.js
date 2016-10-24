 $(function()
    {   $('#btn1,#btn2,#btn3').click(function()
        {   var vert1 = $('.vertline1'),
                vert2 = $('.vertline2'),
                horz = $('.horzline'),
                btn = $(this),
                source = $('.source'),
                sourcePos = source.offset(),
                btnPos = btn.position(),
                vertline1Left = (sourcePos.left + source.width()) / 2;
                vertline1Top =  sourcePos.top + source.height();
                vertHeight = (btnPos.top - vertline1Top) / 2;
                vertline2Left = btnPos.left + (btn.width() / 2) + 8;
                horzWidth = vertline2Left - vertline1Left;
                
            horz.hide().width(0);
            vert2.hide().height(0);
            vert1.hide().height(0);

            horz.show();
            vert2.show();
            vert1.show();

            setTimeout(function()
            {
                vert1
                    .addClass('showing')
                    .css(
                    {   height: vertHeight,
                        top: vertline1Top,
                        left: vertline1Left
                    });
                horz
                    .addClass('showing')
                    .css(
                    {   width: horzWidth,
                        left: vertline1Left,
                        top: (vertline1Top + vertHeight)
                    });
                vert2
                    .addClass('showing')
                    .css(
                    {   height: vertHeight,
                        left: vertline2Left,
                        top: (vertline1Top + vertHeight)
                    });
                
                setTimeout(function()
                {   vert1.removeClass('showing');
                    vert2.removeClass('showing');
                    horz.removeClass('showing');
                }, 3000);
            }, 100);
        });

    });
