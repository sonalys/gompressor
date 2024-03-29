package gompressor

import (
	"encoding/binary"

	ll "github.com/sonalys/gompressor/linkedlist"
	"github.com/sonalys/gompressor/segments"
)

var decoder = binary.BigEndian

func Decode(in []byte) (out *Block, err error) {
	lenIn := len(in)
	var pos int
	out = &Block{
		OriginalSize: int(decoder.Uint64(in)),
		Segments:     &ll.LinkedList[segments.Segment]{},
	}
	bufLen := int(decoder.Uint64(in[8:]))
	pos += 16
	out.Buffer, pos = in[pos:pos+bufLen], pos+bufLen
	for {
		if pos == lenIn {
			break
		}
		if pos > lenIn {
			panic("you messed up pos")
		}
		decoded, offset := segments.DecodeSegment(in[pos:])
		pos += offset
		out.Segments.AppendValue(decoded)
	}
	return
}
